const mysql = require('mysql');

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});
connection.connect();

async function load() {
    return new Promise(async(resolve) => {
        await connection.query('SELECT * FROM birthday', async(error, results, fields) => {
            if (error) throw error;
            const birthdays = [];
            await results.forEach(element => {
                const { UUID: ID, name, birthdate: nextBirthday, age: currentAge, created_at: createdAt } = element
                const birthday = {
                    ID,
                    name,
                    nextBirthday,
                    currentAge,
                    createdAt,
                };
                birthdays.push(birthday);
            });
            resolve(birthdays);
        });
    });
}

function update(obj) {

}

function create(obj) {
    connection.query('INSERT INTO birthday(UUID, name, birthdate, age, created_at) VALUES (?, ?, ?, ?, ?)', [
        obj.ID,
        obj.name,
        obj.nextBirthday,
        obj.currentAge,
        obj.createdAt
    ], async(error, results, fields) => {
        if (error) throw error;
    });
}


module.exports = {
    connection,
    load,
    update,
    create,
}