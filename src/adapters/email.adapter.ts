import nodemailer from 'nodemailer'

export const emailAdapter = {
    async sendEmail(to: string, subject: string, html: string) {
        let transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'arystandev@gmail.com',
                pass: 'mskqxfntedyumrzr'
            }
        })

        return transport.sendMail({
            from: 'arystandev@gmail.com',   // sender address
            to,
            subject,
            html,
        })

    }
}
