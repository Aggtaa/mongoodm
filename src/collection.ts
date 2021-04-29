import {
    Collection as MongoCollection,
    InsertOneWriteOpResult,
    WithId,
    OptionalId,
    FilterQuery,
    Cursor,
    ObjectId,
    ObjectID,
} from 'mongodb';
import { isNullOrUndefined } from 'util';
import { Serializer, LazyLoadProperty } from './serializer';
import { Class, Collections, ICollection } from './types';

export class Collection<TObj, TDoc extends { _id?: unknown } = unknown>
implements ICollection<TObj, TDoc> {

    private readonly owner: Collections;
    private readonly collection: MongoCollection<TDoc>;
    public readonly objectClass: Class<TObj>;

    constructor(
        owner: Collections,
        cls: Class<TObj>,
        collection: MongoCollection<TDoc>,
    ) {
        this.owner = owner;
        this.objectClass = cls;
        this.collection = collection;
    }

    public async exists(): Promise<boolean> {
        return (await this.owner.db.collections())
            .some((c: MongoCollection) => c.namespace === this.collection.namespace);
    }

    public async drop(): Promise<void> {
        if (await this.exists())
            await this.collection.drop();
    }

    public async save(doc: TObj): Promise<TObj> {

        const inst: TDoc = Serializer.serialize(doc, {} as TDoc);
        if (inst._id)
            await this.collection.findOneAndUpdate(
                { _id: inst._id },
                { $set: inst },
                { upsert: true },
            );
        else {
            const res: InsertOneWriteOpResult<WithId<TDoc>> =
                await this.collection.insertOne(inst as OptionalId<TDoc>);

            Serializer.deserializeField(doc, '_id', res.insertedId);
        }

        return doc;
    }

    public async findById(id: string | ObjectId): Promise<TObj> {

        return this.findOne({ _id: new ObjectId(id) as unknown });
    }

    public async findOne(condition: FilterQuery<TDoc>): Promise<TObj> {

        const docs: AsyncIterableIterator<TObj> = this.find(condition);

        for await (const doc of docs)
            return doc;

        return undefined;
    }

    public async* find(condition: FilterQuery<TDoc>): AsyncIterableIterator<TObj> {

        const docs: Cursor<TDoc> = await this.collection.find(condition);

        while (await docs.hasNext()) {
            const doc: TDoc = await docs.next();
            const obj: TObj = new this.objectClass(); // eslint-disable-line new-cap
            const lazyLoadProperties: LazyLoadProperty[] =
                Serializer.deserialize(doc, obj, this.objectClass);
            await this.populate(obj, lazyLoadProperties);
            yield obj;
        }
    }

    public async populate(obj: TObj, properties: LazyLoadProperty[]): Promise<TObj> {
        for (const property of properties)
            await this.populateProperty(obj, property);
        return obj;
    }

    public async populateProperty(obj: TObj, property: LazyLoadProperty): Promise<void> {
        if (isNullOrUndefined(obj[property.name]))
            return;

        const id: ObjectID = new ObjectID(obj[property.name]);
        const coll: Collection<unknown> =
            this.owner.collection(property.refType as Class<unknown>) as Collection<unknown>;
        const refObj: unknown = await coll.findById(id);
        obj[property.name] = refObj;
    }
}
