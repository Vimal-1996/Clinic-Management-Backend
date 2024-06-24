const mongoose = require('mongoose')

const doctorSchema = new mongoose.Schema({
    doctorName:String,
    specialised:String,
    speciality:String,
    email:String,
    password:String,
    accountStatus:Boolean,
})

const Doctor = mongoose.model('Doctor', doctorSchema)

module.exports = Doctor