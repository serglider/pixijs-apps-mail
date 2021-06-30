require('dotenv').config();
const nodemailer = require('nodemailer');

exports.handler = function (event, context, callback) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
          pass: process.env.SMTP_PSW,
        },
    });

    console.log(event.body);

    transporter.sendMail(
        {
            from: 'chernyh39157@gmail.com',
            to: 'chernyh39157+foobar@gmail.com',
            subject: new Date().toLocaleString(),
            text: event.body,
        },
        function (error, info) {
            if (error) {
                callback(error);
            } else {
                callback(null, {
                    statusCode: 200,
                    body: 'Ok',
                });
            }
        }
    );
};
