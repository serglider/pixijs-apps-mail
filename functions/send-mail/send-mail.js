require('dotenv').config();
const nodemailer = require('nodemailer');

const authUser = process.env.SMTP_USER + '@' + process.env.SMTP_PROVIDER;


exports.handler = async function (event) {
    const { httpMethod, body } = event;

    if (httpMethod === 'OPTIONS') {
        return createResponse(200, 'Preflight');
    }

    const data = parseJSON(body);

    if (data === null) {
        return createResponse(422, 'Unprocessable entity');
    }

    if (!isValid(data)) {
        return createResponse(422, 'Incorrect request data');
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
        return createResponse(200, 'OK');
    } catch (e) {
        console.log(e);
        return createResponse(500, 'Something went wrong');
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

function createResponse(code, body) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
    return {
        statusCode: code,
        headers,
        body,
    };
}

function parseJSON(json) {
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
