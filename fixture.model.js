// Import the Mongoose library for MongoDB interaction
const mongoose = require('mongoose');

// Define the Mongoose schema for the fixtures collection
const fixtureSchema = new mongoose.Schema({
  League: String,
  Season: String,
  Date: String,
  HomeTeam: String,
  AwayTeam: String,
  FTHG: Number,
  FTAG: Number,
  Referee: String,
});

// Create a Mongoose model based on the schema, representing the 'Fixture' collection
const Fixture = mongoose.model('Fixture', fixtureSchema);

// Export the Fixture model for use in other parts of the application
module.exports = Fixture;
