import nodemailer from 'nodemailer'

export const emailAdapter = {
    async sendEmail(email: string, subject: string, message: string) {
        let transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'arystandev@gmail.com',
                pass: 'ItsTimeNow23!'
            }
        })

        let info = await transport.sendMail({
            from: 'arystandev@gmail.com',   // sender address
            subject: email,
            to: subject,
            html: message
        })

        return info;
    }
}
