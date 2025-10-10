import nodemailer from 'nodemailer'

export const emailAdapter = {
    async sendEmail(to: string, subject: string, html: string) {
        let transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'arystandev@gmail.com',
                pass: 'mskq xfnt edyu mrzr'
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
