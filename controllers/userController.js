// Importing models and librarys
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

//User sign up
const addUser = async (req, res, next) => {
  const { name, email, password } = req.body; // extracting object properties to add in variables
  console.log("Request received", req.body);
  if (!name || !email || !password) {
    console.log("Values missing");
    return res.sendStatus(400);
  }

  try {
    const existingUser = await User.findOne({ email: email }); // find user with associated email address

    if (existingUser) {  // check if user already exist before adding into database to avoid duplicates
      console.log("Email already exists");
      return res.status(409).send({ message: "Email already exists" });
    }

    bcrypt.hash(password, 10, async (err, hash) => {  // using becrypt library to encrypt the password that takes arguments as password, how many rounds we want to add(more rounds = more security but takes more computation power, less rounds = less security but less computation power)
      console.log(err);
      const newUser = await User.create({  // adding new user entry in table using sequelize "create" method 
        name: name,
        email: email,
        password: hash,
      });
      console.log("User added");
      res.status(201).json(newUser);  // success response to client
    });

  } catch (error) {  // catching errors
    console.log(error, JSON.stringify(error));
    res.status(500).json({ error });  // error response to client
  }
};


// Generating jwt token
const generateToken = (id, name) => {  // jsonwebtoken to authenticate user
  return jwt.sign({ userId: id, name: name }, process.env.JWT_TOKEN);  // signing jwt token with secret jwt key(saved in .env file)
};

//User login
const login = async (req, res, next) => {
  const { email, password } = req.body;  // extracting object properties to add in variables
  console.log("Login Request received", req.body);
  if (!email || !password) {
    console.log("Login Values missing");
    return res.sendStatus(400);
  }

  try {
    const user = await User.findOne({ email: email });  // find user with associated email address
    if (!user) {  // if user not exists with linked email send "Not found" response
      console.log("Email not found");
      return res.status(404).send("Email not found");
    }

    bcrypt.compare(password, user.password, (err, result) => {  // using becrypt library to compare the password that takes arguments as password stored in DB, password which user entered for login
      if (err) {
        throw new Error("Something went wrong");
      }

      if (result) {  // we get result if entered password is correct 
          res.status(200).json({  // successfull login response
          message: "Login successful",
          token: generateToken(user._id, user.name),  // send jwt token that includes user id & name
        });
      } else {
        res.status(401).send("Incorrect password");
      }
    });  
  } catch (error) {  // catching errors
    console.log(error, JSON.stringify(error));
    res.status(501).json({ error });  // error response to client
  }
};


// Getting user profile
const getProfile = async (req, res) => {
  const userId = req.user._id;  // stored user id from the request which was sended by middleware by checking from DB

  try {
    const userProfile = await User.findOne({ _id: userId } );  // check if user id in DB to send associated data in response
    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json({ name: userProfile.name, email: userProfile.email }); // Send user data to show in profile section on frontend

  } catch (error) {  // catching errors
    console.log(error);
    res.status(500).json({ message: 'Server error' });  // error response to client
  }

}

module.exports = {  // exporting functions to use in another files by importing them
  addUser,
  login,
  getProfile
};
