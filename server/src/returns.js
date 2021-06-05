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

module.exports = {
    jsonSuccess,
    jsonError,
}