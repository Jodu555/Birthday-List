const toggle = document.getElementById('toggle');
const form = document.getElementById('form');
const reload = document.getElementById('reload');
const table = document.getElementById('table');
const response = document.getElementById('response');

response.style.display = 'none';

function showResponse(message, timeout, danger) {
    const ext = 'alert-';
    const cls = danger ? 'alert-danger' : 'alert-success';
    response.classList.add(cls);
    response.style.display = '';
    response.innerText = message;
    proof();
    setTimeout(() => {
        hideResponse();
    }, timeout);
}

function hideResponse() {
    response.style.display = 'none';
    response.innerText = '';
    response.classList.remove('alert-danger');
    response.classList.remove('alert-success');
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const obj = {
        name: data.get('name'),
        age: data.get('age'),
        birthDay: data.get('birthDay'),
        birthMonth: data.get('birthMonth'),
    }
    const url = `${API_URL}newBirthDay/${getCookie('auth-token')}`
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(obj)
    }).then((response) => response.json()).then(json => {
        if (json.success) {
            showResponse('New Birthday Successfully Added', 3000, false)
            load();
        } else {
            showResponse(json.message, 3000, true);
        }
    });

})

toggle.addEventListener('click', (event) => {
    if (form.style.display == 'none') {
        form.style.display = '';
        toggle.classList.toggle('btn-success');
        toggle.classList.toggle('btn-danger');
    } else {
        form.style.display = 'none';
        toggle.classList.toggle('btn-success');
        toggle.classList.toggle('btn-danger');
    }
});

reload.addEventListener('click', (event) => {
    load();
});

function proof(params) {
    const url = `${API_URL}validate/${getCookie('auth-token')}`
    fetch(url).then(response => response.json()).then(json => {
        if (!json.success) {
            setCookie('auth-token', '-1', -1);
            sendto('index.html');
        }
    });

    if (!getCookie('auth-token')) {
        sendto('index.html');
    }
}

load();

function load() {
    proof();
    clearTable();
    const url = `${API_URL}birthdays/${getCookie('auth-token')}`
    fetch(url).then(response => response.json()).then(json => {
        if (json.success) {
            renderBirthDays(json.birthdays);
        } else {
            showResponse(json.message, 3000, true);
        }
    });
}

function clearTable() {
    const rowCount = table.rows.length;
    const elem = [];
    for (let i = 1; i < rowCount; i++) {
        elem.push(table.rows[i]);
    }
    elem.forEach(e => {
        e.remove();
    });
}

function getNearest(list) {
    var nearest = Infinity;
    var nearestID = -1;
    list.forEach(item => {
        const time = new Date(item.nextBirthday).getTime();
        if (nearest > time) {
            nearest = time;
            nearestID = item.ID;
        }
    });
    return nearestID;
}

function renderBirthDays(list) {
    const nearest = getNearest(list);

    var ID = 1;
    list.forEach(item => {
        var row;
        if (ID == nearest) {
            row = table.insertRow(1);
            row.classList.add('table-secondary');
        } else {
            row = table.insertRow(-1);
        }
        var cellID = row.insertCell(0);
        var cellName = row.insertCell(1);
        var cellNextBirthday = row.insertCell(2);
        var cellCurrentAge = row.insertCell(3);
        var cellCreatedAt = row.insertCell(4);
        cellID.innerHTML = ID;
        cellName.innerHTML = item.name;
        cellNextBirthday.innerHTML = item.nextBirthday;
        cellCurrentAge.innerHTML = item.currentAge;
        cellCreatedAt.innerHTML = new Date(item.createdAt).toLocaleDateString();
        ID++;
    });

}