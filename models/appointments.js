const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    endTime: Date,
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    reminderSent: {type: Boolean, default: false}
  });
module.exports = mongoose.model('Appointment', appointmentSchema);
  
