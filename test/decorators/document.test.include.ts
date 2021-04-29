/* eslint-disable mocha/no-async-describe */
/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/class-name-casing */
import { expect } from 'chai';
import {
    document, Registry, field, identifier,
} from '../../src';

describe('@document', function () {

    it('expect getting info for unregistered class to fail', async function () {

        expect(function (): string {
            class MissingCollection {
            }
            return Registry.getCollectionName(MissingCollection);
        }()).to.be.undefined;
    });

    it('expect checking for class info to pass', async function () {

        expect(function (): boolean {
            @document({ collection: 'classNameCheck' })
            class ClassNameCheck {
            }
            return Registry.hasDocument(ClassNameCheck);
        }()).to.be.true;
    });

    it('expect checking for invalid class info to pass', async function () {

        expect(function (): boolean {
            class ClassNameCheck2 {
            }
            return Registry.hasDocument(ClassNameCheck2);
        }()).to.be.true;
    });

    it('expect manual collection name to match declaration', async function () {

        expect(function (): string {
                @document({ collection: 'collection1' })
            class ExplicitCollName {
                }
                return Registry.getCollectionName(ExplicitCollName);
        }()).to.equal('collection1');
    });

    describe('collection name generation', function () {
        for (const [cls, coll] of [
            ['User', 'users'],
            ['SuperUser', 'superUsers'],
            ['User21', 'users21'],
            ['Super21User', 'super21Users'],
            ['_Alien_', 'aliens'],
            ['$Super1Duper___User', 'super1DuperUsers'],
        ])
            it(`expect "${cls}" class name to generate collection "${coll}"`, async function () {

                expect(Function('Registry', `
                        class ${cls} {
                        }
                        Registry.addDocument(${cls});
                        return Registry.getCollectionName(${cls});
                    `)(Registry)).to.equal(coll);
            });

        it('expect "$" class name to fail collection name generation', async function () {

            expect(() => Function('Registry', `
                class $ {
                }
                Registry.addDocument($);
                return Registry.getCollectionName($);
            `)(Registry)).to.throw(/convert/);
        });
    });

    it('expect multiple decorators on same class to override collection name', async function () {

        expect(function (): string {
                @document({ collection: 'collection2' })
                @document({ collection: 'collection3' })
            class MultipleDecorators {
                }
                return Registry.getCollectionName(MultipleDecorators);
        }()).to.equal('collection2');
    });

    it('expect manual class registration to pass', async function () {

        expect(function (): string {
            class ManualRegistration {
            }
            Registry.addDocument(ManualRegistration);
            return Registry.getCollectionName(ManualRegistration);
        }()).to.equal('manualRegistrations');
    });

    it('expect multiple classes with same collection name to crash', async function () {

        expect(function (): void {
                @document({ collection: 'collection1_dup' })
            class Class1_1 {
                }
                @document({ collection: 'collection1_dup' })
                class Class1_2 {
                }
        }).to.throw();
    });

    it('expect multiple classes with same name and collection name to crash', async function () {

        expect(function (): void {
                @document({ collection: 'collection2_dup' })
            class Class2_1 {
                }
        }).to.not.throw();

        expect(function (): void {
                @document({ collection: 'collection2_dup' })
            class Class2_1 {
                }
        }).to.throw();
    });
});
