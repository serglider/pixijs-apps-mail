require('dotenv').config();
const nodemailer = require('nodemailer');

const authUser = process.env.SMTP_USER + '@' + process.env.SMTP_PROVIDER;

// {
//     "name": "Vasya",
//     "email": "fobar@mail.ru",
//     "app": "pixijs-club",
//     "content": "Hi There"
// }

exports.handler = async function (event) {
    const { httpMethod, body } = event;

    // if (httpMethod !== 'POST') {
    //     return response(405, 'Method Not Allowed');
    // }

    if (httpMethod === 'OPTIONS') {
        return response(200, 'Preflight');
    }

    const data = parse(body);

    if (data === null) {
        return response(422, 'Unprocessable entity');
    }

    if (!isValid(data)) {
        return response(422, 'Incorrect request data');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: authUser,
            pass: process.env.SMTP_PSW,
        },
    });

    try {
        await transporter.sendMail(createMailObject(data));
        return response(200, 'OK');
    } catch (e) {
        console.log(e);
        return response(500, 'Something went wrong');
    }
};

function createMailObject({ name, email, content, app }) {
    return {
        from: email,
        to: createTargetMail(app),
        subject: createSubject(name, email, app),
        text: content,
    };
}

function createTargetMail(app) {
    return process.env.SMTP_USER + '+' + app + '@' + process.env.SMTP_PROVIDER;
}

function createSubject(name, email, app) {
    return `${name}(${email}) message from ${app}`;
}

function response(code, body) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        // 'Access-Control-Allow-Headers': 'Content-Type',
        // 'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
    return {
        statusCode: code,
        headers,
        body,
    };
}

function parse(json) {
    let data = null;
    try {
        data = JSON.parse(json);
    } catch (e) {}
    return data;
}

function isValid(data) {
    const mandatoryFields = ['name', 'email', 'content', 'app'];
    return mandatoryFields.every((key) => key in data);
}
