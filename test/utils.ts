/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Collection, Db } from 'mongodb';
// import migrate from '../src/migrate';

async function initDatabaseFromFile(db: Db, data: {[x: string]: unknown[]}): Promise<void> {

    const queries: Promise<void>[] =
        Object.entries(data).map(async ([collectionName, collectionData]: [string, unknown[]]) => {
            const collection: Collection = db.collection(collectionName);
            await Promise.all((collectionData as unknown[])
                .map(async (doc: unknown) => {
                    // console.log(`Adding fixture to ${collectionName} collection...`);
                    await collection.insertOne(doc);
                }));
        });

    await Promise.all(queries);
}

export async function initDatabase(db: Db): Promise<Db> {
    await initDatabaseFromFile(db, require('./database').default);
    return db;
}
