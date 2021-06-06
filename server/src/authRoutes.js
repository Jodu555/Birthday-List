const { jsonSuccess, jsonError } = require('./returns.js');
const { v4: uuidv4 } = require('uuid');
var tokens;

function validAuth(obj) {
    return obj.username && obj.username.trim().length > 0 &&
        obj.password && obj.password.trim().length > 0;
}

// 5 Minuten
const tokenExpirationTime = 5 * 60 * 1000;

function auth(req, res) {
    if (validAuth(req.body)) {
        if (req.body.username == process.env.LOGIN_USERNAME && req.body.password == process.env.LOGIN_PASSWORD) {
            const token = uuidv4();
            const obj = jsonSuccess('Valid Credentials!');
            obj.token = token;
            const info = {
                expiration: Date.now() + tokenExpirationTime,
                username: req.body.username,
                password: req.body.password
            }
            tokens.set(token, info);
            res.json(obj);
        } else {
            res.json(jsonError('Invalid username or password'));
        }
    } else {
        res.json(jsonError('Credentials are missing'))
    }
}

function validate(req, res) {
    const token = req.params.token;
    if (tokens.has(token)) {
        console.log(tokens.get(token).expiration, Date.now());
        if (tokens.get(token).expiration > Date.now()) {
            res.json(jsonSuccess('Valid Token'));
        } else {
            tokens.delete(token);
            res.json(jsonError('Expired Token'));
        }
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