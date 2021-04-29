/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectID } from 'mongodb';
import { plural } from 'pluralize';
import { isUndefined } from 'util';
import { debug, Debugger } from './debug';
import { Class, getKnownType } from './types';

export type FieldName = string;
export type PropertyName<T> = keyof T;

export interface DocumentRegistryOptions {
    collection: string;
}

export interface FieldRegistryOptions<TType extends Function | string> {
    name: string;
    identifier: boolean;
    type: TType;
}

export interface RegisteredClass<T> {
    class: Class<T>;
    options: Omit<Partial<DocumentRegistryOptions>, 'collection'>;
    idProperty: RegisteredProperty<T>;
    properties: Map<FieldName, RegisteredProperty<T>>;
}

export interface RegisteredProperty<T> {
    name: PropertyName<T>;
    type: Function;
    refType?: Function;
    refProperty?: string;
    options: Omit<Partial<FieldRegistryOptions<Function>>, 'name'>;
}

export class Registry {
    private static debug: Debugger = debug.extend('registry');
    static readonly docs: Map<symbol, RegisteredClass<any>> = new Map();

    static toCollectionName(className: string): string {
        // split 'longClass2Name' onto words ['long', 'class', '2', 'name']
        const words: string[] = className
            .replace(/([a-z](?=[^a-z])|(\d(?=[^\d])))/g, '$1 ')
            .toLowerCase()
            .split(/[^a-z\d]+/)
            .filter((word: string) => word !== '');

        if (!words || words.length === 0)
            throw new Error(`Cannot convert class name ${className} to collection name`);

        // pluralize last word
        for (let idx: number = words.length - 1; idx >= 0; idx--)
            if (words[idx].match(/^[a-z]+$/)) {
                words[idx] = plural(words[idx]);
                break;
            }

        // camelcase
        const result: string =
            words.shift() + words.map((w: string) => w[0].toUpperCase() + w.substr(1)).join('');
        return result;
    }

    public static getDocument<T>(cls: Class<T>): [symbol, RegisteredClass<T>] {
        const match: [symbol, RegisteredClass<any>] =
            Array.from(Registry.docs.entries())
                .find(([, v]: [symbol, RegisteredClass<any>]) => v.class === cls);
        if (!match)
            return [undefined, undefined];
        return match as [symbol, RegisteredClass<T>];
    }

    public static hasDocument<T>(cls: Class<T>): boolean {
        return !!Registry.getDocument(cls);
    }

    public static getIdentifierProperty<T>(cls: Class<T>): RegisteredProperty<T> {
        const [, doc] = Registry.getDocument(cls);
        if (doc)
            return doc.idProperty;
        return undefined;
    }

    public static getField<T>(
        cls: Class<T>,
        prop: PropertyName<T>,
    ): [symbol, FieldName, RegisteredProperty<T>] {

        const [collection, doc] = Registry.getDocument(cls);
        if (!doc)
            return [undefined, undefined, undefined];

        const match: [FieldName, RegisteredProperty<T>] =
            Array.from(doc.properties.entries())
                .find(([, v]: [FieldName, RegisteredProperty<T>]) =>
                    v.name === prop);
        if (isUndefined(match))
            return [undefined, undefined, undefined];

        return [collection, match[0], match[1]];
    }

    public static addDocument<T>(
        cls: Class<T>,
        options: Partial<DocumentRegistryOptions> = {},
    ): RegisteredClass<T> {

        const key: symbol = Symbol.for(
            options && 'collection' in options
                ? options.collection
                : Registry.toCollectionName(cls.name),
        );

        const docByColl: RegisteredClass<any> = Registry.docs.get(key);

        if (docByColl && docByColl.class !== cls)
            throw new Error(`Collection name "${Symbol.keyFor(key)}" is already associated with class "${docByColl.class.name}"`);

        let doc: RegisteredClass<T>;

        const match: [symbol, RegisteredClass<T>] = Registry.getDocument(cls);
        if (match[0]) {
            // the document class was already registered, update its options if needed

            doc = match[1];
            if (options && 'collection' in options) {
                delete (options.collection);

                // caller decided to change collection name for the document
                // move it to the new key
                if (match[0] !== key) {
                    Registry.docs.delete(match[0]);
                    Registry.docs.set(key, doc);
                }
                doc.options = { ...doc.options, ...options };
            }

            this.debug('Updated doc %o with %j', cls.name, doc.options);
        }
        else {
            // its a new document class, just register it

            if (options && 'collection' in options)
                delete (options.collection);

            const idProperty: RegisteredProperty<T> = {
                name: '_id' as keyof T, // use fake property that does not exist
                type: String,
                options: { type: ObjectID, identifier: true },
            };

            doc = {
                class: cls,
                options,
                idProperty,
                properties: new Map(),
            };
            doc.properties.set('_id', idProperty);
            Registry.docs.set(key, doc);

            this.debug('Added doc %o with %j', cls.name, doc.options);
        }
        return doc;
    }

    public static addField<T>(
        obj: T,
        prop: PropertyName<T>,
        options: Partial<FieldRegistryOptions<Function | string>> = {},
    ): RegisteredProperty<T> {

        const cls: Class<T> = obj.constructor as unknown as Class<T>;

        let doc: RegisteredClass<T>;
        [, doc] = Registry.getDocument(cls);
        if (!doc)
            doc = Registry.addDocument(cls);

        const fields: Map<FieldName, RegisteredProperty<T>> = doc.properties;

        if (options && options.identifier)
            options.name = '_id';
        if (options && options.name === '_id') {
            options.identifier = true;
            options.type = 'ObjectID';
        }

        const key: FieldName = options && 'name' in options ? options.name : (prop as string);

        let typeConvertedOptions: FieldRegistryOptions<Function> =
            options as unknown as FieldRegistryOptions<Function>;
        if (options && typeof (options.type) === 'string')
            typeConvertedOptions.type = getKnownType(options.type);

        let field: RegisteredProperty<T>;

        const match: [symbol, FieldName, RegisteredProperty<T>] = Registry.getField(cls, prop);
        if (match[2]) {
            // the field was already registered, update its options if needed

            field = match[2];
            if (options && 'name' in options) {
                delete (options.name);

                // caller decided to change field name
                // move it to the new key
                if (match[1] !== key) {
                    fields.delete(match[1]);
                    fields.set(key, field);
                }
                field.options = { ...field.options, ...typeConvertedOptions };
            }
            this.debug('Updated field %o.%o with %j', cls.name, prop, field.options);
        }
        else {
            // its a new field, just register it

            if (options && 'name' in options)
                delete (options.name);

            const propertyType: Function = Reflect.getMetadata('design:type', obj, prop as string);
            typeConvertedOptions = { type: propertyType, ...typeConvertedOptions };

            field = {
                name: prop,
                type: propertyType,
                options: typeConvertedOptions,
            };
            fields.set(key, field);
            this.debug('Added field %o.%o with %j', cls.name, prop, field.options);
        }
        if (field.options.identifier)
            doc.idProperty = field;

        this.resolveForeignKeys();

        return field;
    }

    public static getCollectionName<T>(cls: Class<T>): string {
        const [name] = Registry.getDocument(cls);
        if (!name)
            return undefined;
        return Symbol.keyFor(name);
    }

    static getProperty<T>(cls: Class<T>, fieldName: FieldName): RegisteredProperty<T> {
        const [, doc] = Registry.getDocument(cls);

        if (!doc)
            return undefined;

        return doc.properties.get(fieldName);
    }

    static resolveForeignKeys(): void {

        for (const [, doc] of Registry.docs.entries()) {
            for (const [, prop] of doc.properties.entries()) {
                const propType: Function = prop.type;
                const [, foreignDoc]: [symbol, RegisteredClass<unknown>] =
                    Registry.getDocument(propType as Class<any>);
                if (!foreignDoc)
                    continue;

                prop.options.type = getKnownType('ObjectID');
                prop.refType = prop.type;
                prop.refProperty = foreignDoc.idProperty.name;

                this.debug('Resolving reference %o.%o to %o.%o', doc.class.name, prop.name, foreignDoc.class.name, foreignDoc.idProperty.name);
            }
        }
    }
}
