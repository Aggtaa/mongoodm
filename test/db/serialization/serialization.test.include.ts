/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import { ObjectID } from 'mongodb';
import {
    document, field, identifier,
} from '../../../src';
import { Serializer, LazyLoadProperty } from '../../../src/serializer';

@document()
class SerializationTest {
    @identifier()
    id: string;

    @field()
    name: string;

    @field({ name: 'yearsOld', type: String })
    age: number;

    constructor(id?: string, name?: string, age?: number) {
        this.id = id;
        this.name = name;
        this.age = age;
    }
}

@document()
class RefChild {
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
class RefParent {
    @field()
    child: RefChild;

    constructor(child?: RefChild) {
        this.child = child;
    }
}

describe('serialization tests', function () {

    it('expect serializing an object to pass', async function () {

        const doc: any = Serializer.serialize(
            new SerializationTest('123456789012345678901234', 'test obj', 15),
            {},
        );

        expect(doc._id.equals(new ObjectID('123456789012345678901234'))).to.be.true;
        expect(doc.name).to.equal('test obj');
        expect(doc.yearsOld).to.equal('15');
    });

    it('expect serializing a foreign key to pass', async function () {

        const targetC: RefChild = new RefChild('123456789012345678901234', 'name1');
        const targetP: RefParent = new RefParent(targetC);

        const doc: any = Serializer.serialize(
            targetP,
            {},
        );
        expect(doc._id).to.be.undefined;
        expect(doc.child.equals(new ObjectID('123456789012345678901234'))).to.be.true;
    });

    it('expect serializing a foreign key with no ID to fail', async function () {

        const targetC: RefChild = new RefChild(undefined, 'name1');
        const targetP: RefParent = new RefParent(targetC);

        expect(() => Serializer.serialize(
            targetP,
            {},
        )).to.throw(/id/i);
    });

    it('expect serializing an "undefined" to pass', async function () {

        expect(Serializer.serialize(undefined, {})).to.be.undefined;
    });

    it('expect deserializing an object to pass', async function () {

        const target: SerializationTest = new SerializationTest();
        expect(Serializer.deserialize(
            {
                _id: new ObjectID('123456789012345678901234'),
                name: 'test1',
                yearsOld: 5,

            },
            target,
            SerializationTest,
        )).to.deep.equal([]);
        expect(target.id).to.equal('123456789012345678901234');
        expect(target.name).to.equal('test1');
        expect(target.age).to.equal(5);
    });

    it('expect deserializing foreign key to pass', async function () {

        const target: RefParent = new RefParent();
        const lazyProperties: LazyLoadProperty[] = Serializer.deserialize(
            { child: new ObjectID('123456789012345678901234') },
            target,
            RefParent,
        );
        expect(lazyProperties).to.have.length(1);
        expect(lazyProperties[0]).to.have.property('name', 'child');
        expect(lazyProperties[0]).to.have.property('refType', RefChild);
        expect(lazyProperties[0]).to.have.property('refProperty', 'id');
    });

    it('expect deserializing an "undefined" to pass', async function () {

        const target: SerializationTest = new SerializationTest();
        expect(Serializer.deserialize(
            undefined,
            target,
            SerializationTest,
        )).to.deep.equal([]);
    });

    it('expect deserializing an "undefined" class to fail', async function () {

        expect(() => Serializer.deserialize(
            undefined,
            {},
            undefined,
        )).to.throw(/missing/);
    });

    it('expect deserializing an non-registered class to fail', async function () {

        class Dummy {
        }

        expect(() => Serializer.deserialize(
            undefined,
            new Dummy(),
            Dummy,
        )).to.throw(/unknown/);
    });

    it('expect deserializing an ID field to pass', async function () {

        expect(Serializer.deserializeField(
            new RefChild(),
            '_id',
            new ObjectID('123456789012345678901234'),
        )).to.equal('123456789012345678901234');
    });

    it('expect deserializing a missing field to pass', async function () {

        expect(() => Serializer.deserializeField(
            new RefChild(),
            'missing',
            new ObjectID('123456789012345678901234'),
        )).to.throw();
    });
});
