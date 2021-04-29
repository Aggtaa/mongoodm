import { MongoMemoryServer } from 'mongodb-memory-server';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Connection } from '../../src';

chai.use(chaiAsPromised);

describe('database tests', function () {

    before(async function () {

        const mongod: MongoMemoryServer = new MongoMemoryServer({
            instance: {
                port: 37017,
                //  storageEngine: 'ephemeralForTest',
                // auth: true,
            },
        });

        await mongod.start();
    });

    it('expect opening connection with wrong username/password to fail', async function () {
        await expect(Connection.create({
            host: 'localhost',
            port: 37017,
            database: 'mongoodm',
            username: 'aaa',
            password: 'aaa',
        })).to.be.rejectedWith(/authentication/i);
    });

    let conn1: Connection;

    it('expect opening connection by host:port to pass', async function () {
        conn1 = await Connection.create({
            host: 'localhost',
            port: 37017,
            database: 'mongoodm',
        });
        expect(conn1.mongo.isConnected()).to.be.true;
    });

    it('expect opening connection with default port to pass', async function () {
        const conn: Connection = await Connection.create({
            host: 'localhost',
            database: 'mongoodm',
        });
        expect(conn.mongo.isConnected()).to.be.true;
        await conn.close();
        expect(conn.mongo.isConnected()).to.be.false;
    });

    it('expect opening an open connection to do nothing', async function () {
        expect(conn1.mongo.isConnected()).to.be.true;
        await conn1.open();
        expect(conn1.mongo.isConnected()).to.be.true;
    });

    it('expect closing a connection to pass', async function () {
        expect(conn1.mongo.isConnected()).to.be.true;
        await conn1.close();
        expect(conn1.mongo.isConnected()).to.be.false;
    });


    it('expect closing a closed connection to do nothing', async function () {
        expect(conn1.mongo.isConnected()).to.be.false;
        await conn1.close();
        expect(conn1.mongo.isConnected()).to.be.false;
    });

    it('expect reopening a closed connection to pass', async function () {
        await conn1.open();
        expect(conn1.mongo.isConnected()).to.be.true;
    });

    it('expect opening connection by uri to pass', async function () {
        const conn: Connection = await Connection.create({
            uri: 'mongodb://localhost:37017/mongoodm',
        });
        expect(conn.mongo.isConnected()).to.be.true;
    });

    require('./serialization/connection.test.include');
    require('./serialization/typeConverter.test.include');
    require('./serialization/serialization.test.include');
    require('./serialization/collection.test.include');
});
