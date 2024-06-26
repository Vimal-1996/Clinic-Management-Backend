const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')
const Patient = require('../database/patientModel')

const medicineSchema = new mongoose.Schema({
    medicines:{
        type:[String],
    },
    patientId:{
        type:mongoose.Types.Schema.ObjectId,
        ref:Patient
    }
})

const Medicine = mongoose.model('Medicine', medicineSchema)
module.exports = Medicine;