/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import { ObjectID } from 'mongodb';
import {
    document, identifier,
} from '../../../src';
import { TypeConverter } from '../../../src/typeConverter';
import { getKnownType } from '../../../src/types';

@document()
class ConversionTest {
    @identifier()
    id: string;

    constructor(id: string) {
        this.id = id;
    }
}

describe('type conversion tests', function () {

    for (const cls of [
        'ObjectID',
    ])
        it(`expect getting class "${cls}" by name to pass`, async function () {

            expect(getKnownType(cls).name).to.equal(cls);
        });

    it('expect getting non-existent class by name to fail', async function () {

        expect(() => getKnownType('A129346320483')).to.throw();
    });

    for (const [from, value, to, target] of [
        [undefined, undefined, undefined, undefined],
        [String, '15', Number, 15],
        [Boolean, true, Number, 1],
        [Number, 15, String, '15'],
        [String, '123456789012345678901234', ObjectID, new ObjectID('123456789012345678901234')],
        [ConversionTest, new ConversionTest('123456789012345678901234'), ObjectID, new ObjectID('123456789012345678901234')],
    ])
        it(`expect converting from "${(from as Function)?.name}" to "${(to as Function)?.name}" to pass`, async function () {

            const v: any = TypeConverter.convertValue(
                value,
                from as Function,
                to as Function,
                from === ConversionTest,
            );
            if (v instanceof ObjectID)
                expect((v as ObjectID).equals(target as any)).to.be.true;
            else
                expect(v).to.equal(target);
        });
});
