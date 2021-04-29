/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable mocha/no-async-describe */
/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/class-name-casing */
import { expect } from 'chai';
import {
    document, Registry, field, identifier,
} from '../../src';

describe('@identifier', function () {

    it('expect @identifier to pass', async function () {

        const [, fieldName, prop] = (function () {
            class Identifier {
                    @identifier()
                    field1: number;
            }
            return Registry.getField(Identifier, 'field1');
        }());
        expect(fieldName).to.equal('_id');
        expect(prop.options.identifier).to.equal(true);
        expect(prop.options.type.name).to.equal('ObjectID');
    });

    it('expect @field to generate identifier by name', async function () {

        const [, fieldName, prop] = (function () {
            class Identifier2 {
                    @field({ name: '_id' })
                    field1: number;
            }
            return Registry.getField(Identifier2, 'field1');
        }());
        expect(fieldName).to.equal('_id');
        expect(prop.options.identifier).to.equal(true);
        expect(prop.options.type.name).to.equal('ObjectID');
    });

    it('expect @field to generate identifier by options', async function () {

        const [, fieldName, prop] = (function () {
            class Identifier3 {
                    @field({ identifier: true })
                    field1: number;
            }
            return Registry.getField(Identifier3, 'field1');
        }());
        expect(fieldName).to.equal('_id');
        expect(prop.options.identifier).to.equal(true);
        expect(prop.options.type.name).to.equal('ObjectID');
    });

    it('expect getting identifier property on class to pass', async function () {

        expect((function () {
            @document()
            class IDPropetyCheck {
                @identifier()
                id: string;
            }
            return Registry.getIdentifierProperty(IDPropetyCheck);
        }()).name).to.equal('id');
    });

    it('expect getting implicit identifier property on class to pass', async function () {

        expect((function () {
            @document()
            class IDPropetyCheckImpl {
                @field()
                name: string;
            }
            return Registry.getIdentifierProperty(IDPropetyCheckImpl);
        }()).name).to.equal('_id');
    });

    it('expect getting identifier property on non-existent class to fail', async function () {

        expect(function () {
            class IDPropetyCheck2 {
                id: string;
            }
            return Registry.getIdentifierProperty(IDPropetyCheck2);
        }()).to.be.undefined;
    });
});
