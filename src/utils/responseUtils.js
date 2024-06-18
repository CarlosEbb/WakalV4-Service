//responseUtils.js
export const createJSONResponse = (code, message, data, others) => {
    let response = {
        code: code,
        message: message,
        data: data
    };

    if (others !== undefined && others !== null) {
        response.others = others;
    }

    return response;
};