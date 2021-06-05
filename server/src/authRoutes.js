const { jsonSuccess, jsonError } = require('./returns.js');
const { v4: uuidv4 } = require('uuid');
var tokens;

function validAuth(obj) {
    return obj.username && obj.username.trim().length > 0 &&
        obj.password && obj.password.trim().length > 0;
}

function auth(req, res) {
    if (validAuth(req.body)) {
        if (req.body.username == process.env.LOGIN_USERNAME && req.body.password == process.env.LOGIN_PASSWORD) {
            const token = uuidv4();
            const obj = jsonSuccess('Valid Credentials!');
            obj.token = token;
            tokens.set(token, req.body);
            res.json(obj);
        } else {
            res.json(jsonError('Invalid username or password'));
        }
    } else {
        res.json(jsonError('Credentials are missing'))
    }
}

function validate(req, res) {
    if (tokens.has(req.params.token)) {
        res.json(jsonSuccess('Valid Token'));
    } else {
        res.json(jsonError('Invalid Token'));
    }
}


module.exports = (_tokens) => {
    tokens = _tokens;
    return {
        auth,
        validate
    }
};