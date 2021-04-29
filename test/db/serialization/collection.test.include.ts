import { expect } from 'chai';
import { ObjectID } from 'mongodb';
import {
    document, field, Collection, identifier,
} from '../../../src';
import { shared } from '../shared';

async function toArray<T>(iterable: AsyncIterableIterator<T>): Promise<T[]> {
    const arr: T[] = [];
    for await (const item of iterable)
        arr.push(item);
    return arr;
}

@document()
class CollTest1 {

    @identifier()
    thisIsAnIdentifier: string;

    @field()
    name: string;

    constructor(id?: string, name?: string) {
        this.thisIsAnIdentifier = id;
        this.name = name;
    }
}

@document()
class CollTest2Child {

    @identifier()
    id: string;

    @field()
    name: string;

    constructor(id?: string, name?: string) {
        this.id = id;
        this.name = name;
    }
}

@document()
class CollTest2 {

    @identifier()
    thisIsAnIdentifier: string;

    @field()
    child: CollTest2Child;

    constructor(id?: string, child?: CollTest2Child) {
        this.thisIsAnIdentifier = id;
        this.child = child;
    }
}

describe('collection save/load tests', function () {

    const id: string = new ObjectID('123456789012345678901234').toString();
    let coll: Collection<CollTest1>;

    before(async function () {

        coll = shared.conn.collection(CollTest1);
    });

    it('expect saving an object to pass', async function () {

        const target: CollTest1 = new CollTest1(id, 'hello');
        await coll.save(target);
        expect(target.thisIsAnIdentifier).to.equal(id);
    });

    let id2: string;

    it('expect saving an object to autogenerate ID', async function () {

        const target: CollTest1 = new CollTest1(undefined, 'hello2');
        expect(target.thisIsAnIdentifier).to.be.undefined;
        await coll.save(target);
        expect(target.thisIsAnIdentifier).to.exist;
        id2 = target.thisIsAnIdentifier;
    });

    it('expect finding one by id to pass', async function () {

        const obj: CollTest1 = await coll.findById(id);
        expect(obj.thisIsAnIdentifier).to.equal(id);
        expect(obj).to.have.property('name', 'hello');
    });

    it('expect finding one by condition to pass', async function () {

        const obj: CollTest1 = await coll.findOne({ name: 'hello2' });
        expect(obj.thisIsAnIdentifier).to.equal(id2);
        expect(obj).to.have.property('name', 'hello2');
    });

    it('expect finding one by wrong condition to return undefined', async function () {

        const obj: CollTest1 = await coll.findOne({ name: 'hello3' });
        expect(obj).to.be.undefined;
    });

    it('expect populating a foreign key to pass', async function () {

        const coll1: Collection<CollTest2Child> = shared.conn.collection(CollTest2Child);
        const coll2: Collection<CollTest2> = shared.conn.collection(CollTest2);

        const o1: CollTest2Child = new CollTest2Child(undefined, 'hello21');
        const o2: CollTest2 = new CollTest2(undefined, o1);
        await coll1.save(o1);
        await coll2.save(o2);
        expect(o1.id).to.exist;
        expect(o2.thisIsAnIdentifier).to.exist;

        const o2loaded: CollTest2 = await coll2.findById(o2.thisIsAnIdentifier);
        expect(o2loaded.thisIsAnIdentifier).to.equal(o2.thisIsAnIdentifier);
        expect(o2loaded.child).to.exist;
        expect(o2loaded.child.id).to.equal(o1.id);
        expect(o2loaded.child.name).to.equal(o1.name);
    });

    it('expect populating an empty foreign key to pass', async function () {

        const coll2: Collection<CollTest2> = shared.conn.collection(CollTest2);

        const o2: CollTest2 = new CollTest2(undefined, undefined);
        await coll2.save(o2);
        expect(o2.thisIsAnIdentifier).to.exist;

        const o2loaded: CollTest2 = await coll2.findById(o2.thisIsAnIdentifier);
        expect(o2loaded.thisIsAnIdentifier).to.equal(o2.thisIsAnIdentifier);
        expect(o2loaded.child).to.be.undefined;
    });

    it('expect dropping a collection to pass', async function () {

        @document()
        class DropTest {
        }

        const dropColl: Collection<DropTest> = shared.conn.collection(DropTest);

        const target: DropTest = new DropTest();
        await dropColl.save(target);

        expect(await dropColl.exists()).to.be.true;
        await dropColl.drop();
        expect(await dropColl.exists()).to.be.false;
    });

    it('expect dropping a non-existent collection to pass', async function () {

        @document()
        class DropTest2 {
        }

        const dropColl: Collection<DropTest2> = shared.conn.collection(DropTest2);
        expect(await dropColl.exists()).to.be.false;
        await dropColl.drop();
        expect(await dropColl.exists()).to.be.false;
    });
});
