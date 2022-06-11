const nodemailer = require("nodemailer");

const USERNAME = process.env.MAILTRAP_USER;
const PASSWORD = process.env.MAILTRAP_PASS

const sendEmail = async (email, text) => {

    try {

        const transporter = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 587,
            secure: false,
            auth: {
                user: USERNAME,
                pass: PASSWORD,
            },
        });

        let info = await transporter.sendMail({
            from: "Test App",
            to: email,
            subject: "Recupera tu contraseña",
            text: text,
        });

        return info;

    } catch (error) {
        res.send({
            Error: error,
            Message: "Error al enviar el email"
        });
    }
};

module.exports = sendEmail;