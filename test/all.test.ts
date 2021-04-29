/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-dynamic-require */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { readdirSync } from 'fs';

chai.use(chaiAsPromised);

describe('API tests', function () {

    describe('decorator tests', function () {

        for (const file of readdirSync(`${__dirname}/decorators`))
            require(`./decorators/${file}`);
    });

    for (const file of readdirSync(`${__dirname}/db`).filter((f: string) => f.endsWith('test.include.ts')))
        require(`./db/${file}`);
});
