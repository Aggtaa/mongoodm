import { Registry, DocumentRegistryOptions } from '../registry';
import { Class } from '../types';

export function document(options?: Partial<DocumentRegistryOptions>): ClassDecorator {

    return <TFunction extends Function>(target: TFunction): TFunction => {

        Registry.addDocument(
            target as unknown as Class<unknown>,
            options,
        );

        return target;
    };
}
