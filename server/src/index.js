const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()
const database = require('./database.js');

const app = express();
app.use(cors());
app.use(morgan('tiny'));
app.use(helmet());
app.use(express.json());


const tokens = new Map();
// tokens.set('00bca6b0-032e-496b-8119-ee04e76e59bf', null);
let birthdays;

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

function existBirthdayByID(id) {
    birthdays.forEach(element => {
        if (element.ID === id) {
            return true;
        }
    });
}

function getBirthdayByID(id) {
    var elem;
    birthdays.forEach((element, index) => {
        if (element.ID === id) {
            elem = element;
            return;
        }
    });
    return elem;
}

app.post('/editBirthDay/:ID/:token', (req, res) => {
    const id = req.params.ID;
    const token = req.params.token;
    const body = req.body;
    const now = new Date(Date.now())
    if (tokens.has(token)) {
        const obj = jsonSuccess('Valid Token');
        if (!existBirthdayByID(id)) {
            if (validBirthDay(req.body)) {
                const date = new Date(now.getFullYear(), body.birthMonth - 1, body.birthDay);
                const after = {
                    name: body.name,
                    currentAge: body.age,
                    nextBirthday: date.toLocaleDateString(),
                }
                const before = getBirthdayByID(id);
                before.name = after.name;
                before.currentAge = after.currentAge;
                before.nextBirthday = after.nextBirthday;
                database.update(before)
                obj.obj = before;
                res.json(obj);
            } else {
                res.json(jsonError('Credentials are missing or Incorrect'))
            }
        } else {
            res.json(jsonError('Birthday ID does not exist!'))
        }
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
            database.create(birthday);
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
app.listen(PORT, async() => {
    console.log(`Express App Listening on ${PORT}`);
    birthdays = await database.load();
    console.log(`Loaded ${birthdays.length} birthday/s from the Database`);
});