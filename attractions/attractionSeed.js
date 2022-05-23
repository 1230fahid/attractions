const attractions = require('./attractionInfo.js');
const mongoose = require('mongoose');
//console.log(attractions);

mongoose.connect('mongodb://localhost:27017/worldAttractions', {}) //set up connection to mongo (still need mongod on powershell). movieApp is an example
    .then(() => {
        console.log("CONNECTION OPEN!!!!");
    })
    .catch((err) => {
        console.log("OH NO ERROR!!!!");
        console.log(err);
    })


const Attraction = require('../models/attractions');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

const create = async () => {
    await Attraction.deleteMany({});
    for (attraction of attractions) {
        const p = new Attraction(attraction);
        await p.save();
        console.log(p);
    }
}

create()
    .then(() => {
        mongoose.connection.close();
    })