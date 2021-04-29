import { isUndefined } from 'util';
import { debug, Debugger } from './debug';
import { Registry, RegisteredProperty } from './registry';
import { Class } from './types';

export class TypeConverter {

    public static debug: Debugger = debug.extend('serializer:convert');

    static convertValue(
        value: unknown,
        fromType: Function,
        toType: Function,
        isIdObject: boolean,
    ): unknown {
        this.debug('Converting %j from %o to %o', value, fromType?.name, toType?.name);

        if (isUndefined(value))
            return undefined;

        if (isIdObject) {
            const idProp: RegisteredProperty<unknown> =
                Registry.getIdentifierProperty(fromType as Class<unknown>);
            value = value[idProp.name];
            if (isUndefined(value))
                throw new Error('Cannot serialize reference to an object without ID');
        }


        return toType(value);
    }
}
