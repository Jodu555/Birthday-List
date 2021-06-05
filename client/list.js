let birthdays = [];
const toggle = document.getElementById('toggle');
const editform = document.getElementById('editform');
const reload = document.getElementById('reload');
const table = document.getElementById('table');
const response = document.getElementById('response');

response.style.display = 'none';

let currentEditID;

editform.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(editform);
    const obj = {
        name: data.get('name'),
        age: data.get('age'),
        birthDay: data.get('birthDay'),
        birthMonth: data.get('birthMonth'),
    }
    const url = `${API_URL}editBirthDay/${currentEditID}/${getCookie('auth-token')}`
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(obj)
    }).then((response) => response.json()).then(json => {
        if (json.success) {
            showResponse('Birthday Successfully Updated', 3000, false)
            load();
        } else {
            showResponse(json.message, 3000, true);
        }
    });
    $('#editModal').modal('hide');
    var myModal = new bootstrap.Modal(document.getElementById('editModal'), {
        keyboard: false
    })
    myModal.hide()
})

function deleteBirthday(id) {
    const url = `${API_URL}deleteBirthDay/${id}/${getCookie('auth-token')}`
    fetch(url).then((response) => response.json()).then(json => {
        if (json.success) {
            showResponse('Birthday Successfully Deleted', 3000, false)
            load();
        } else {
            showResponse(json.message, 3000, true);
        }
    });
}

function editBirthday(id) {
    currentEditID = id;
    let birthday;
    birthdays.forEach(element => {
        if (element.ID == id) {
            birthday = element;
        }
    });

    const date = new Date(birthday.nextBirthday);

    document.getElementById('modal-title').innerHTML = 'Edit: ' + id;
    document.getElementById('edit-name').value = birthday.name;
    document.getElementById('edit-age').value = birthday.currentAge;
    document.getElementById('edit-day').value = date.getDate();
    document.getElementById('edit-month').value = date.getMonth() + 1;

}


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
    }).catch(error => {
        proof();
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
    }).catch(error => {
        console.error(error);
        setCookie('auth-token', '-1', -1);
        sendto('index.html');
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
    }).catch(error => {
        proof();
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
            console.log(item.ID);
            nearest = time;
            nearestID = item.ID;
        }
    });
    return nearestID;
}

function renderBirthDays(list) {
    birthdays = list;
    var nearest = getNearest(list);

    var ID = 1;
    list.forEach(item => {
        var row;
        if (item.ID == nearest) {
            row = table.insertRow(1);
            row.classList.add('table-primary');
        } else {
            row = table.insertRow(-1);
        }
        var cellID = row.insertCell(0);
        var cellName = row.insertCell(1);
        var cellNextBirthday = row.insertCell(2);
        var cellCurrentAge = row.insertCell(3);
        var cellCreatedAt = row.insertCell(4);
        var cellAction = row.insertCell(5);
        cellID.innerHTML = ID;
        cellName.innerHTML = item.name;
        cellNextBirthday.innerHTML = item.nextBirthday;
        cellCurrentAge.innerHTML = item.currentAge;
        cellCreatedAt.innerHTML = new Date(item.createdAt).toLocaleDateString();
        cellAction.innerHTML = `<button type="button" class="btn btn-outline-info" data-bs-toggle="modal" data-bs-target="#editModal" onclick="editBirthday('${item.ID}')" >Edit</button>
            <button type="button" style="margin-left: 5.5%;" class="btn btn-outline-danger" onclick="deleteBirthday('${item.ID}')">Delete</button>`;
        ID++;
    });

}