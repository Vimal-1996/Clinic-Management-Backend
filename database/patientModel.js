const mongoose = require('mongoose')

const patientSchema = new mongoose.Schema({
    patientName:String,
    age:String,
    mobileNumber:String,
    role:String,
    email:String,
    password:String,
    accountStatus:Boolean,
})

const Patient = mongoose.model('Patient', patientSchema)

module.exports = Patient