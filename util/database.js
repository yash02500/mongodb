// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient;

// const mongoConnect = callback => {
//     MongoClient.connect(
//     'mongodb+srv://tech1organisation:mongocool002007@cluster0.yjmod.mongodb.net/demo?retryWrites=true&w=majority&appName=Cluster0',
//     {
//         tls: true, // Ensure TLS is being used
//         tlsAllowInvalidCertificates: false,
//         tlsAllowInvalidHostnames: false
//     }
//     ).then(client => {
//         console.log('connected');
//         callback(client);
//     })
//     .catch(err => {
//     console.log(err, 'error connecting');
//     });
// };

// module.exports = mongoConnect;



// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient;
// const uri = 'mongodb+srv://tech1organisation:mongocool002007@cluster0.yjmod.mongodb.net/demo?retryWrites=true&w=majority&appName=Cluster0';

// const client = new MongoClient(uri,{
//     serverSelectionTimeoutMS: 90000 // Increase timeout if necessary
// ,    tlsAllowInvalidCertificates: true

// });
 
// const main = async () => {
//     try{
//        await client.connect();
//     }catch(error){
//         console.log(error);
//     } 
// }

// module.exports = main;

const dotenv = require('dotenv');
dotenv.config();


const mongoose = require('mongoose');

const uri = process.env.URI;
const mongoConnect = () => {
mongoose.connect(uri);
console.log('connected')
}


// const main = async () => {
//     try{
//         const data = await Price.create({amount: 44, cate: 'mobile'}); 
//         if(data){
//             console.log('got', data);
//         }
//     }catch(error){
//         console.log(error);
//     }
// }
// main();

module.exports = mongoConnect;