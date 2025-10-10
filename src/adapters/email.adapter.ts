// adapters/email-adapter.ts
import nodemailer from 'nodemailer';

function normalizeAppPassword(s?: string) {
    return (s ?? '').replace(/\s+/g, ''); // убираем пробелы из 16-значного app password
}

const MAIL_USER = process.env.MAIL_USER || 'arystandev@gmail.com';
const RAW_MAIL_PASS = process.env.MAIL_PASS || 'mskq xfnt edyu mrzr'; // <-- из ENV, без хардкода
const MAIL_PASS = normalizeAppPassword(RAW_MAIL_PASS);
const MAIL_FROM = process.env.MAIL_FROM || MAIL_USER;

// ЕДИНЫЙ транспорт с пулом соединений
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,        // Gmail: да
    pool: true,          // пул подключений
    maxConnections: 3,   // чуть-чуть коннектов
    maxMessages: 100,    // сколько писем на коннект
    auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,   // без пробелов!
    },
    // logger: true,     // включи для локальной отладки
    // debug: true,
    connectionTimeout: 20_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
});

// Полезно 1 раз при старте (можешь вызывать из init):
async function verifyTransport() {
    try {
        await transporter.verify();
        console.log('[mailer] transporter OK');
    } catch (err: any) {
        console.error('[mailer] verify failed:', err?.code, err?.response, err?.message);
    }
}
verifyTransport().catch(() => {});

export const emailAdapter = {
    async sendEmail(to: string, subject: string, html: string) {
        try {
            const info = await transporter.sendMail({
                from: MAIL_FROM, // должен совпадать с MAIL_USER на Gmail
                to,
                subject,
                html,
            });
            return info;
        } catch (err: any) {
            // Максимально информативный лог:
            console.error('[mailer] sendMail error:', {
                code: err?.code,            // EAUTH, ETIMEDOUT, ESOCKET, EENVELOPE...
                command: err?.command,      // API команда SMTP, где упало
                response: err?.response,    // “535-5.7.8 Username and Password not accepted…”
                message: err?.message,
            });
            throw err; // пусть верхний уровень решает — вернуть 204 или 500
        }
    },
};
