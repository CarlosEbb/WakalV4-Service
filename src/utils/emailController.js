// emailController.js
import nodemailer from 'nodemailer';

// Esta función envía un correo electrónico con el contenido proporcionado y un archivo adjunto
export async function sendEmail(to, subject, text, attachments = []) {
    try {
        // Configurar el transporte de correo
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Contenido del correo electrónico
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: to,
            subject: subject,
            html: text,
            attachments: attachments
        };

        // Enviar el correo electrónico
        await transporter.sendMail(mailOptions);

        console.log('Correo electrónico enviado correctamente.');
    } catch (error) {
        console.error('Error al enviar el correo electrónico:', error);
        throw error;
    }
}
