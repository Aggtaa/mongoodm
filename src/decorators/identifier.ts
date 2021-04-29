import { field } from './field';

export function identifier(): PropertyDecorator {
    return field({ identifier: true });
}
