const expect = require('chai').expect;
const authMiddleware = require('../middleware/is-auth');

it ('should throw error if no authorization header', () => {
 const req = {
     get: () => null
 }
    expect(() => authMiddleware( req, {}, ()=>{})).to.throw('Not authenticated');
});

it('it should throw error if the authorization header is only one string', () => {
    const req = {
        get: (headerName) => 'xzy-wrong-token'
    }
    expect(() => authMiddleware( req, {}, ()=>{})).to.throw();
})