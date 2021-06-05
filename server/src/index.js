const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()
const database = require('./database.js');
const { jsonSuccess, jsonError } = require('./returns.js');

const app = express();
app.use(cors());
app.use(morgan('tiny'));
app.use(helmet());
app.use(express.json());

const tokens = new Map();
const { auth, validate } = require('./authRoutes')(tokens);


tokens.set('00bca6b0-032e-496b-8119-ee04e76e59bf', null);
let birthdays;
const { validBirthDay, existBirthdayByID, getBirthdayByID, getBirthdayByIDIndex } = require('./birthdayFunctions.js')()

app.get('/', (req, res) => {
    res.json({
        message: 'BirthDay-List API works just fine!',
    })
});



app.post('/auth', (req, res) => { auth(req, res); });
app.get('/validate/:token', (req, res) => { validate(req, res); });

app.post('/editBirthDay/:ID/:token', (req, res) => {
    const id = req.params.ID;
    const token = req.params.token;
    const body = req.body;
    const now = new Date(Date.now())
    if (tokens.has(token)) {
        const obj = jsonSuccess('Valid Token');
        if (existBirthdayByID(id)) {
            if (validBirthDay(req.body)) {
                const date = new Date(now.getFullYear(), body.birthMonth - 1, body.birthDay);
                const after = {
                    name: body.name,
                    currentAge: body.age,
                    nextBirthday: date.getTime(),
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

app.get('/deleteBirthday/:ID/:token', (req, res) => {
    const id = req.params.ID;
    const token = req.params.token;
    const body = req.body;
    if (tokens.has(token)) {
        const obj = jsonSuccess('Valid Token');
        if (existBirthdayByID(id)) {
            database.remove(getBirthdayByID(id));
            birthdays.splice(getBirthdayByIDIndex(id), 1)
            obj.extend = 'Birthday Deleted';
            res.json(obj)
        } else {
            res.json(jsonError('Birthday ID does not exist!'))
        }
    } else {
        res.json(jsonError('Invalid Token'));
    }
})

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
                nextBirthday: date.getTime(),
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

function manageBirthday(birthday) {
    const now = new Date(Date.now());
    const date = new Date(birthday.nextBirthday);
    if (date.getTime() < now.getTime()) {
        const yearDiff = now.getFullYear() - date.getFullYear() || 1;
        date.setFullYear(date.getFullYear() + yearDiff);
        const after = birthday;
        after.currentAge += yearDiff;
        after.nextBirthday = date.getTime();
        database.update(after);
        console.log(`Year differenc detected auto fixing: ${birthday.name}`)
        console.log(`|-> (Differenc: ${yearDiff} updated `);
        console.log(`|-> (from : ${birthday.currentAge}-Age and Birthday: ${new Date(birthday.nextBirthday).toLocaleDateString()})`);
        console.log(`|-> (to : ${after.currentAge}-Age and Birthday: ${date.toLocaleDateString()})`);
        console.log(`|-->> (Fixed!!)`);
    }
}

app.get('/birthdays/:token', (req, res) => {
    if (tokens.has(req.params.token)) {
        const obj = jsonSuccess('Valid Token');
        birthdays.forEach(element => {
            manageBirthday(element);
        });
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