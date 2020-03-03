const expect = require('chai').expect;
const sinon = require('sinon');
const User = require('../../models/user');
const AuthController = require('../../controllers/auth');

describe('Auth controller -Login', () => {
    it('Should throw an error with 500 if accessing database fails', () => {
        sinon.stub(User, 'findOne');
        User.findOne.throws();

        User.findOne.restore();
    })


})