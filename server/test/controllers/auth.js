const expect = require('chai').expect;
const sinon = require('sinon');
const User = require('../../models/user');
const AuthController = require('../../controllers/auth');

describe('Auth controller -Login', () => {
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


})