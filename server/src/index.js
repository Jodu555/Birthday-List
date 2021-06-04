const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

const app = express();
app.use(cors());
app.use(morgan('tiny'));
app.use(helmet());
app.use(express.json());

const tokens = new Map();
const birthdays = [{
    ID: 1,
    name: 'xxx',
    nextBirthday: '04.06.2021',
    currentAge: '20',
    createdAt: 1622764205149,
}];

app.get('/', (req, res) => {
    res.json({
        message: 'BirthDay-List API works just fine!',
    })
});

function validAuth(obj) {
    return obj.username && obj.username.trim().length > 0 &&
        obj.password && obj.password.trim().length > 0;
}

function validBirthDay(obj) {
    return obj.name && obj.name.trim().length > 0 &&
        obj.age && obj.age > 0 && obj.age <= 100 &&
        obj.birthDay && obj.birthDay > 0 && obj.birthDay <= 31 &&
        obj.birthMonth && obj.birthMonth > 0 && obj.birthMonth <= 12;
}

function jsonError(message) {
    return {
        success: false,
        message: message,
    };
}

function jsonSuccess(message) {
    return {
        success: true,
        message: message,
    };
}

app.post('/auth', (req, res) => {
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
});

app.get('/validate/:token', (req, res) => {
    if (tokens.has(req.params.token)) {
        res.json(jsonSuccess('Valid Token'));
    } else {
        res.json(jsonError('Invalid Token'));
    }
});

app.post('/newBirthDay/:token', (req, res) => {
    if (tokens.has(req.params.token)) {
        const obj = jsonSuccess('Valid Token');
        if (validBirthDay(req.body)) {
            const body = req.body;
            const now = new Date(Date.now())
            const date = new Date(now.getFullYear(), body.birthMonth - 1, body.birthDay);
            const birthday = {
                ID: uuidv4(),
                name: body.name,
                currentAge: body.age,
                nextBirthday: date.toLocaleDateString(),
                createdAt: Date.now(),
            }
            birthdays.push(birthday);
            obj.obj = birthday;
            res.json(obj);
        } else {
            res.json(jsonError('Credentials are missing or Incorrect'))
        }
    } else {
        res.json(jsonError('Invalid Token'));
    }
});

app.get('/birthdays/:token', (req, res) => {
    if (tokens.has(req.params.token)) {
        const obj = jsonSuccess('Valid Token');
        obj.birthdays = birthdays;
        res.json(obj);
    } else {
        res.json(jsonError('Invalid Token'));
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Express App Listening on ${PORT}`);
});