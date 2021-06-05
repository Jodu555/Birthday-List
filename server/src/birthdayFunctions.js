var birthdays;

function validBirthDay(obj) {
    return obj.name && obj.name.trim().length > 0 &&
        obj.age && obj.age > 0 && obj.age <= 100 &&
        obj.birthDay && obj.birthDay > 0 && obj.birthDay <= 31 &&
        obj.birthMonth && obj.birthMonth > 0 && obj.birthMonth <= 12;
}

function existBirthdayByID(id) {
    var bool = false;
    birthdays.forEach(element => {
        if (element.ID === id) {
            bool = true;
        }
    });
    return bool;
}

function getBirthdayByID(id) {
    var elem;
    birthdays.forEach((element) => {
        if (element.ID === id) {
            elem = element;
            return;
        }
    });
    return elem;
}

function getBirthdayByIDIndex(id) {
    var i;
    birthdays.forEach((element, index) => {
        if (element.ID === id) {
            i = index;
            return;
        }
    });
    return i;
}

module.exports = (_birthdays) => {
    birthdays = _birthdays;
    return {
        validBirthDay,
        existBirthdayByID,
        getBirthdayByID,
        getBirthdayByIDIndex,
    }
};