const { Double } = require('mongodb');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StaffSchema = new Schema({
    StaffNumber: {
        type:String,
        required: true
    },
    StaffName: {
        type:String,
        required: true
    },
    PositionTitle: {
        type:String,
        required: true
    },
    StaffRating:{
        type: Number,
        required: true
    },
    Salary:{
        type: Number,
        required: true
    },
    Password:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Staff', StaffSchema);