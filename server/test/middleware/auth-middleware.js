const expect = require('chai').expect;
const authMiddleware = require('../../middleware/is-auth');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

describe('Auth middleware test', () => {
    it('should throw error if no authorization header', () => {
        const req = {
            get: () => null
        }
        expect(() => authMiddleware(req, {}, () => { })).to.throw('Not authenticated');
    });

    it('it should throw error if the authorization header is only one string', () => {
        const req = {
            get: (headerName) => 'xzy-wrong-token'
        }
        expect(() => authMiddleware(req, {}, () => { })).to.throw();
    })

    it('should throw an error if token is not valid', () => {
        const req = {
            get: (headerName) => 'Bearer xzy-wrong-token'
        }
        expect(() => authMiddleware(req, {}, () => { })).to.throw();
    });

    it('Should yield a user Id after decoding the token', () => {
        const req = {
            get: (headerName) => 'Bearer sample-token'
        }
        sinon.stub(jwt, 'verify');
        jwt.verify.returns({ userId: 'abc' });
        authMiddleware(req, {}, () => { })
        expect(req).to.have.property('userId', 'abc');
        expect(jwt.verify.called).to.be.true;
        jwt.verify.restore();
    })
});
