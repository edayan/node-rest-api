const expect = require('chai').expect;
const sinon = require('sinon');
const User = require('../../models/user');
const AuthController = require('../../controllers/auth');
const mongoose = require('mongoose');

describe('Auth controller', () => {

    before((done) => {
        mongoose
            .connect(
                ''
            )
            .then(resulr => {
                console.log('db connection successfull');
                const user = new User({
                    email: 'test@test.com',
                    password: 'testpass',
                    name: 'Test',
                    posts: [],
                    _id: '5c0f66b979af55031b34728a'
                })
                return user.save();
            }).then(() => {
                done();
            }).catch(err => {
                console.log('db connection failed', err); done();
            });
    });

    beforeEach(() => {
        // runs before each test case.
    })

    afterEach(() => {
        // runs after each test case.
    });

    it('Should throw an error with 500 if accessing database fails', async (done) => {
        sinon.stub(User, 'findOne');
        User.findOne.throws();
        const req = {
            body: {
                email: 'test@test.com',
                password: 'tester'
            }
        }
        try {
            let result = await AuthController.login(req, {}, () => { });
            done();
        } catch (error) {
            expect(error).to.be.an('error')
            done();
        }

        User.findOne.restore();
    })

    it('Should send a user for valid user id', (done) => {
        const req = { userId: '5c0f66b979af55031b34728a' };
        const res = {
            statusCode: 500,
            userStatus: null,
            status: (code) => {
                this.statusCode = code;
                return this;
            },
            json: (data) => {
                this.userStatus = data.status
            }
        }

        AuthController.getUserStatus(req, res, () => { }).then(() => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.userStatus).to.be.equal('Not approved');
            done();

        })

    })

    after(() => {
        User.deleteMany({})
            .then(() => {
                return mongoose.disconnect()
            }).then(() => {
                done();
            });
    });
})
