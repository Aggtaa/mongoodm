/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNullOrUndefined, isUndefined } from 'util';
import { URL } from 'url';
import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import { Registry } from './registry';
import { Collection } from './collection';
import { Collections, Class } from './types';

export type UriConnectionOptions = {
    uri: string;
}

export type HostPortConnectionOptions = {
    host: string;
    port?: number;
    database: string;
    username?: string;
    password?: string;
}

export type ConnectionOptions = UriConnectionOptions | HostPortConnectionOptions;

export class Connection implements Collections {
    private readonly options: ConnectionOptions;
    public mongo: MongoClient;
    public db: Db;
    private readonly collections: Map<string, Collection<any, any>> = new Map();

    constructor(options: ConnectionOptions) {
        this.options = options;
    }

    public static create(options: UriConnectionOptions);
    public static create(options: HostPortConnectionOptions);
    public static async create(options: ConnectionOptions): Promise<Connection> {
        const connection: Connection = new Connection(options);
        await connection.open();
        return connection;
    }

    public async open(): Promise<void> {
        if (!this.mongo) {

            const options: MongoClientOptions = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            };

            if ('uri' in this.options) {
                this.mongo = new MongoClient(this.options.uri, options);
                await this.mongo.connect();
                this.db = this.mongo.db();
            }
            else {
                const uri: URL = new URL(`mongodb://${this.options.host}`);
                if (this.options.port)
                    uri.port = String(this.options.port);
                if (!isNullOrUndefined(this.options.username)) {
                    uri.username = this.options.username;
                    uri.password = this.options.password;
                }

                this.mongo = new MongoClient(uri.toString(), options);
                await this.mongo.connect();
                this.db = this.mongo.db(this.options.database);
            }
        }
        else if (!this.mongo.isConnected())
            await this.mongo.connect();
    }

    public async close(): Promise<void> {
        if (this.mongo && this.mongo.isConnected())
            await this.mongo.close();
    }

    public collection<TD, TC>(docClass: Class<TD>): Collection<TD, TC> {
        const collectionName: string = Registry.getCollectionName(docClass);
        if (isUndefined(collectionName))
            throw new Error(`Class "${docClass.name}" is not registered`);

        if (!this.collections.has(collectionName))
            this.collections.set(
                collectionName,
                new Collection<TD, TC>(
                    this,
                    docClass,
                    this.db.collection(collectionName),
                ),
            );
        return this.collections.get(collectionName);
    }
}
