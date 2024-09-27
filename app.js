const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
dotenv.config();
const app = express();

//Parsing URL-encoded bodies and using querystring library for parsing(extended:false)
app.use(bodyParser.urlencoded({ extended: false }));
//Parsing JSON bodies (as sent by API clients)
app.use(bodyParser.json());

//Importing routes
 const userRoute = require("./routes/userRoute");
 const adminRoute = require("./routes/adminRoute");
 const userAppointments = require("./routes/appointmentRoute");
 const servicesRoute = require("./routes/servicesRoute");

//Importing database(from util) 
const mongoConnect = require("./util/database");

//Serving static files from the "public" directory
app.use(express.static("public"));

//Accessing routes
 app.use("/user", userRoute, userAppointments);
 app.use("/admin", adminRoute);
 app.use("/services", servicesRoute);

app.use(cors());

const port = process.env.PORT;

// Connecting tp mongodb
mongoConnect(() => {
  console.log("MongoDB connected");
});


// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  app.get("/user", (req, res, next) => {  
    res.sendFile(path.join(__dirname, "public", "login.html"));
  });
  
  // default admin route 
  app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "adminLogin.html"));
  });
  
});

