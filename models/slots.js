const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    date: Date,  // may need to edit if bug occured
    isBooked: { type: Boolean, default: false } 
});
module.exports = mongoose.model('Slot', slotSchema);

