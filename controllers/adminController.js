const Admin = require("../models/admin");
const Service = require("../models/services");
const Appointment = require("../models/appointments")
const User = require("../models/user");
const Slot = require("../models/slots");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

//Admin sign up
const addAdmin = async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        console.log("Values missing");
        return res.sendStatus(400);
    }

    try {
        const existingAdmin = await Admin.findOne({ email: email });

        if (existingAdmin) {
            console.log("Email already exists");
            return res.status(409).send({ message: "Email already exists" });
        }

        bcrypt.hash(password, 10, async (err, hash) => {
            console.log(err);
            const newAdmin = await Admin.create({
                name: name,
                email: email,
                password: hash,
            });
            console.log("Admin added");
            res.status(201).json(newAdmin);
        });

    } catch (error) {
        console.log(error, JSON.stringify(error));
        res.status(500).json({ error });
    }
};


// // Generating jwt token
const generateToken = (id, name) => {
    return jwt.sign({ adminId: id, name: name }, process.env.JWT_TOKEN);
};

// //Admin login
const adminLogin = async (req, res, next) => {
    const { email, password } = req.body;
    console.log("Login Request received", req.body);
    if (!email || !password) {
        console.log("Login Values missing");
        return res.sendStatus(400);
    }

    try {
        const admin = await Admin.findOne({ email: email });
        if (!admin) {
            console.log("Email not found");
            return res.status(404).send("Email not found");
        }

        bcrypt.compare(password, admin.password, (err, result) => {
            if (err) {
                throw new Error("Something went wrong");
            }

            if (result) {
                res.status(200).json({
                    message: "Login successful",
                    adminToken: generateToken(admin.id, admin.name),
                });
            } else {
                res.status(401).send("Incorrect password");
            }
        });
    } catch (error) {
        console.log(error, JSON.stringify(error));
        res.status(501).json({ error });
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


// // Add services
const addServices = async (req, res) => {
    console.log("Request received", req.body);
    const { name, description, duration, price } = req.body;
    if (!name || !description || !duration || !price) {
        return res.sendStatus(400);
    }

    try {
        const addNewService = await Service.create({
            name: name,
            description: description,
            duration: duration,
            price: price
        });
        res.status(201).json({ message: 'New service added', addNewService });

    } catch (error) {
        console.log(error, JSON.stringify(error));
        res.status(500).json({ error });
    }
}


// // Deleting services
const deleteService = async (req, res) => {
    const serviceId = req.params.serviceId;
    try {
        const deletedService = await Service.deleteOne({ id: serviceId });
        console.log("Service deleted")
        res.status(201).json(deletedService);


    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}


// // Get users list
const getUsersList = async (req, res) => {
    try {
        const users = await User.find();
        res.status(201).json(users);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}


// Get appointments
const getUsersAppointments = async (req, res) => {
    try {
        const getUserAppointments = await Appointment.find()
            .populate('slotId')
            .populate('serviceId')
            .populate('userId');
        console.log("Here are user Appointments with related details")
        res.status(201).json(getUserAppointments);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}

// // Get appointments
// const getUsersAppointments = async (req, res) => {
//     try {
//         const getUserAppointments = await Appointments.findAll({
//             include: [
//                 {
//                     model: Slots,  
//                     as: 'slot',   
//                     attributes: ['id', 'date', 'time'] 
//                 },
//                 {
//                     model: Services,
//                     as: 'service',
//                     attributes: ['id', 'name']
//                 },
//                 {
//                     model: User,
//                     as: 'User',
//                     attributes: ['id', 'name', 'email']
//                 }
//             ]
//         });

//         console.log("Here are user Appointments with related details")
//         res.status(201).json(getUserAppointments);

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error });
//     }
// }


// // Deleting user appointment
// const cancelAppointment = async (req, res) => {
//     const appointmentId = req.params.appointmentId;
//     try {
//         const canceledUserAppointment = await Appointments.destroy({ where: { id: appointmentId } });
//         console.log("Appointment canceled")
//         res.status(201).json(canceledUserAppointment);

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error });
//     }
// }


// // Remove user
const removeUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        const removedUser = await User.deleteOne({ _id: userId });
        console.log("User removed")
        res.status(201).json(removedUser);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}


// // Select user to edit
// const editUser = async (req, res) => {
//     const userId = req.params.userId
//     try {
//         const user = await User.findOne({ where: { id: userId } });
//         res.status(201).json(user);

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error });
//     }
// }

// // Save edited user
// const saveEditedUser = async (req, res) => {
//     const { name, email } = req.body;
//     try {
//         const user = await User.findOne({ where: { id: req.params.userId } });
//         user.id = req.params.userId
//         user.name = name;
//         user.email = email;

//         await user.save();

//         res.status(201).json(user);

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error });
//     }
// }


// // Get all slots
const getSlots = async (req, res) => {
    try {
        const slots = await Slot.find();
        res.status(201).json(slots);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}


// // Add slot
const addSlot = async (req, res) => {
    console.log("Request received", req.body);
    //const { date, time } = req.body;
    //if (!date || !time) {
      //  return res.sendStatus(400);
    //}
    const {dateTime} = req.body;
    if(!dateTime){
        return res.sendStatus(400);
    }

    try {
        const addNewSlot = await Slot.create({
            // date: date,
            // time: time
            date: dateTime
        });
        res.status(201).json({ message: 'New slot added', addNewSlot });

    } catch (error) {
        console.log(error, JSON.stringify(error));
        res.status(500).json({ error });
    }
}


// // Delete slot
const deleteSlot = async (req, res) => {
    const slotId = req.params.slotId;
    try {
        const deletedSlot = await Slot.deleteOne({ _id: slotId });
        console.log("Slot deleted")
        res.status(201).json(deletedSlot);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}

module.exports = {
    addAdmin,
    adminLogin,
    getServices,
    addServices,
    deleteService,
    getUsersList,
    getSlots,
    addSlot,
    deleteSlot,
    removeUser,
    // editUser,
    // saveEditedUser,
    getUsersAppointments,
    // cancelAppointment,
};
