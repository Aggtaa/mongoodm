import { ObjectID, Db } from 'mongodb';

export type Class<T> = new(...args: any) => T; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface ICollection<TD, TC extends { _id?: unknown } = unknown> { // eslint-disable-line @typescript-eslint/no-empty-interface
}

export interface Collections {
    db: Db;
    collection<TD, TC>(docClass: Class<TD>): ICollection<TD, TC>;
}

export function getKnownType(typeName: string): Function {
    switch (typeName.toLowerCase()) {
        case 'objectid':
            return ObjectID;
        default:
            throw new Error(`Unknown type "${typeName}"`);
    }
}
