// Importing models and librarys
const Service = require("../models/services");
const Appointment = require("../models/appointments")
const Slot = require("../models/slots")
const User = require("../models/user")
const nodemailer = require('nodemailer');
const moment = require('moment-timezone');
const cron = require('node-cron');

// Booking user appointment 
const bookAppointments = async (req, res) => {
  const { slot, service } = req.body;
  const userId = req.user._id;

  try {
    const selectedSlot = await Slot.findOne({ _id: slot });
    if (!selectedSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (selectedSlot.isBooked) {
      return res.status(400).json({ message: "Slot is already booked." });
    }

    const selectedService = await Service.findOne({ _id: service });
    if (!selectedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Combine slot's date and time (assuming selectedSlot.date and selectedSlot.time are separate)
    const slotDateTime = new Date(`${selectedSlot.date}`);

    // Calculate the appointment start and end times
    let appointmentStartTime = new Date(slotDateTime);
    let appointmentEndTime = new Date(appointmentStartTime.getTime());
    appointmentEndTime.setMinutes(appointmentStartTime.getMinutes() + selectedService.duration);

    // Save appointment in MongoDB
    const appointment = await Appointment.create({
      userId: userId,
      slotId: slot,
      serviceId: service,
      startTime: appointmentStartTime, // Save combined date & time as start time
      endTime: appointmentEndTime,     // Calculate and save end time
      status: 'active'
    });

    // Mark slot as booked
    selectedSlot.isBooked = true;
    await selectedSlot.save();

    console.log("Appointment booked");
    res.status(201).json(appointment);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};


// Getting user appointments
const getAppointments = async (req, res) => {
  const userId = req.user.id;
  try {
    const getUserAppointments = await Appointment.find({ userId: userId })
      .populate('slotId')
      .populate('serviceId');

    console.log("Here are user Appointments with related details")
    res.status(201).json(getUserAppointments);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
}


/// Deleting user appointment
const cancelAppointment = async (req, res) => {
  const appointmentId = req.params.id;
  const slotId = req.params.slotId;

  try {
    // Fetch the appointment to cancel
    const appointment = await Appointment.findOne({ _id: appointmentId });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Fetch the slot associated with the appointment
    const slot = await Slot.findOne({ _id: slotId });
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // Delete the appointment and update the slot simultaneously
    await Promise.all([
      Appointment.deleteOne({ _id: appointmentId }), // Delete the appointment
      Slot.updateOne({ _id: slotId }, { $set: { isBooked: false } }) // Mark slot as available
    ]);

    console.log("Appointment canceled and slot updated");
    res.status(200).json({ message: "Appointment canceled and slot is now available" });

  } catch (error) {
    console.error("Error canceling appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Slots availability
const getOpenSlots = async (req, res) => {
  try {
    const currentDateTime = new Date();  // Current date and time
    // const currentDate = new Date(currentDateTime.setHours(0, 0, 0, 0));  // Start of today

    // Find all active appointments that have expired
    const expiredAppointments = await Appointment.find({
      status: 'active',
      $or: [
        { 'slotId.date': { $lt: currentDateTime } },    // did changes do ctr z if wanna see
        { 
           endTime: { $lte: currentDateTime } // Compare using Date object
        } 
      ]
    }).populate('slotId');

    // Mark slots of expired appointments as available and update appointment status
    for (let appointment of expiredAppointments) {
      const associatedSlot = appointment.slotId;
      if (associatedSlot) {
        // Mark the slot as available
        associatedSlot.isBooked = false;
        await associatedSlot.save();  // Update the slot status without deleting it

        // Mark appointment as completed
        appointment.status = 'completed';
        await appointment.save();  // Save the updated appointment status
      }
    }

    // Fetch available slots (in the future)
    const availableSlots = await Slot.find({
      isBooked: false,
      date: { $gte: currentDateTime }  // Date comparison
    });

    res.status(200).json({ slots: availableSlots });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};


  // Get services
  const getServices = async (req, res) => {
    try {
      const services = await Service.find();
      res.status(201).json(services);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  }


  // Schedule a job to run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running Cron Job to Send Appointment Reminders');

  try {
    // Get the current date and time
    const currentDateTime = moment(); // Adjust timezone if necessary
    const oneHourLater = moment(currentDateTime).add(1, 'hour');

    console.log('Current Date Time:', currentDateTime.format('YYYY-MM-DD HH:mm:ss'));
    console.log('One Hour Later:', oneHourLater.format('YYYY-MM-DD HH:mm:ss'));

    // Find appointments that are scheduled within the next hour
    const upcomingAppointments = await Appointment.find({
      status: 'active',
      reminderSent: false,  // Only send reminders if not already sent
      $or: [
        {
          $and: [
            { 'slotId.date': currentDateTime.toDate() },  // Current date
            { endTime: { $gte: currentDateTime.toDate(), $lte: oneHourLater.toDate() } }  // Appointments between current time and one hour later
          ]
        },
        {
          $and: [
            { 'slotId.date': oneHourLater.toDate() },  // The next day's date if crossing midnight
            { endTime: { $lte: oneHourLater.toDate() } }
          ]
        }
      ]
    }).populate('userId slotId serviceId');  // Populating necessary fields

    console.log('Fetched upcoming appointments:', upcomingAppointments);

    // Send reminder emails for each upcoming appointment
    if (upcomingAppointments.length === 0) {
      console.log('No appointments found for the next hour.');
    } else {
      for (const appointment of upcomingAppointments) {
        await sendReminderEmail(appointment);
      }
    }
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
  }
});

// Nodemailer transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SENDER,  // Your email address
    pass: process.env.SENDER_PASS    // Your email password or API key
  },
});

// Send Reminder function
async function sendReminderEmail(appointment) {
  try {
    const { userId, slotId, serviceId, _id } = appointment;

    if (!appointment.reminderSent) {
      const userEmail = userId.email;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Appointment Reminder',
        text: `Dear Customer,\n\nThis is a reminder for your upcoming appointment.\n\nService: ${serviceId.name}\nDate: ${moment(slotId.date).format('YYYY-MM-DD')}\nTime: ${moment(slotId.date).format('HH:mm:ss')}\n\nThank you!`,
      };

      // Send the email
      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent: ' + info.response);

          try {
            // Update the appointment to mark that the reminder has been sent
            appointment.reminderSent = true;
            await appointment.save();
            console.log('Reminder status updated for appointment ID:', _id);
          } catch (err) {
            console.log('Error updating reminderSent status:', err);
          }
        }
      });
    }
  } catch (error) {
    console.log('Error in sendReminderEmail function:', error);
  }
}


  module.exports = {
    bookAppointments,
    getAppointments,
    cancelAppointment,
    getServices,
    getOpenSlots
  }


