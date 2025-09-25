import expressBasicAuth from "express-basic-auth";

export const basic = expressBasicAuth({
    users: {admin: 'qwerty'},
    challenge: true
})
