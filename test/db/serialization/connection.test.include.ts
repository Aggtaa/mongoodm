import { expect } from 'chai';
import {
    document, field, Connection,
} from '../../../src';
import { shared } from '../shared';
import { initDatabase } from '../../utils';

describe('connection tests', function () {

    before(async function () {

        shared.conn = await Connection.create({
            host: 'localhost',
            port: 37017,
            database: 'mongoodm',
        });

        await initDatabase(shared.conn.db);
    });

    it('expect getting collection by class to pass', async function () {

        @document({ collection: 'parents' })
        class Parent {
            @field()
            field1: boolean;
        }
        expect(shared.conn.collection(Parent).objectClass).to.equal(Parent);
    });

    it('expect getting collection by invalid class to fail', async function () {

        class Invalid {
        }

        expect(() => shared.conn.collection(Invalid)).to.throw();
    });
});
