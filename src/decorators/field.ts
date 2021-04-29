/* eslint-disable @typescript-eslint/ban-types */
import 'reflect-metadata';

import { Registry, FieldRegistryOptions } from '../registry';

export function field(
    options?: Partial<FieldRegistryOptions<Function | string>>,
): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {

        Registry.addField(
            target,
            propertyKey as keyof unknown,
            options,
        );
    };
}
