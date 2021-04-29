/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNullOrUndefined, isUndefined } from 'util';
import { debug, Debugger } from './debug';
import {
    Registry, RegisteredClass, RegisteredProperty,
} from './registry';
import { TypeConverter } from './typeConverter';
import { Class } from './types';

export interface LazyLoadProperty {
    name: string;
    refType: Function;
    refProperty: string;
}

export class Serializer {

    public static debug: Debugger = debug.extend('serializer');

    static deserialize<TObj, TDoc>(
        fromDoc: TDoc,
        toObj: TObj,
        toObjClass: Class<TObj>,
    ): LazyLoadProperty[] {

        if (!toObjClass)
            throw new Error('Cannot deserialize missing object type');

        Serializer.debug(`Deserializing object of class "${toObjClass.name}"`);

        const [, cls]: [symbol, RegisteredClass<TObj>] =
            Registry.getDocument(toObjClass);

        if (!cls)
            throw new Error(`Cannot deserialize unknown object type "${toObjClass.name}"`);

        const lazyLoadProperties: LazyLoadProperty[] = [];
        if (!isNullOrUndefined(fromDoc))
            for (const [field, property] of cls.properties.entries()) {
                this.deserializeProperty(toObj, property, fromDoc[field]);
                if (property.refType)
                    lazyLoadProperties.push({
                        name: property.name as string,
                        refType: property.refType,
                        refProperty: property.refProperty,
                    });
            }
        return lazyLoadProperties;
    }

    static serialize<TObj, TDoc>(fromObj: TObj, toDoc: TDoc): TDoc {

        Serializer.debug(`Serializing object of class "${fromObj?.constructor?.name}"`);

        if (isNullOrUndefined(fromObj))
            return undefined;

        const [, cls]: [symbol, RegisteredClass<TObj>] =
            Registry.getDocument(fromObj.constructor as Class<TObj>);

        for (const [field, property] of cls.properties.entries()) {
            const v: unknown = this.serializeProperty(fromObj, property);
            if (!isUndefined(v))
                toDoc[field] = v;
        }

        return toDoc;
    }

    static deserializeField<T, TP>(obj: T, fieldName: string, value: unknown): TP {
        const property: RegisteredProperty<T> =
            Registry.getProperty(obj.constructor as Class<T>, fieldName);
        if (!property)
            throw new Error(`Serialization error, class "${obj.constructor.name}" property missing for field "${fieldName}"`);

        return this.deserializeProperty(obj, property, value) as TP;
    }

    static deserializeProperty<T, TP>(
        obj: T,
        property: RegisteredProperty<T>,
        value: unknown,
    ): TP {
        const propType: Function = property.type;
        const fieldType: Function = property.options.type;

        let propValue: TP;
        if (property.refType)
            propValue = TypeConverter.convertValue(value, fieldType, String, false) as TP;
        else
            propValue = TypeConverter.convertValue(value, fieldType, propType, false) as TP;

        obj[property.name as string] = propValue;
        return propValue;
    }

    static serializeProperty<T, TP>(
        obj: T,
        property: RegisteredProperty<T>,
    ): TP {
        const propValue: unknown = obj[property.name as string];

        const propType: Function = property.type;
        const fieldType: Function = property.options.type;

        const fieldValue: TP =
            TypeConverter.convertValue(propValue, propType, fieldType, !!property.refType) as TP;
        return fieldValue;
    }
}
