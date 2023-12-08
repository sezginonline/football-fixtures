#!/usr/bin/env node
const streamifier = require('streamifier');
const program = require('commander');
const axios = require('axios');
const csvParser = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

// Constants
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/football-fixtures';
const CSV_URL_BASE = 'https://example.com/';

// Connect to the MongoDB database using the specified URI
mongoose.connect(MONGODB_URI);

// Use Mongoose model for fixtures
const Fixture = require('./fixture.model');

// Total promise count
let totalPromiseCount;

// Fetch fixtures CSV file using Axios
async function fetchCSVFile(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch CSV file: ${error.message}`);
    process.exit(1);
  }
}

// Upsert fixtures to MongoDB
async function upsertFixtures(league, season, csvData) {
  const fixtures = [];

  // Use streamifier to create a readable stream from the CSV data
  streamifier.createReadStream(csvData)
    .pipe(csvParser())
    .on('data', (row) => {
      // Warn the user in case a different file scheme was used
      if (!row.Date || !row.HomeTeam || !row.AwayTeam) {
        console.error(`Different file scheme was used in ${league} ${season}.`);
        process.exit(1);
      }

      // Define filter criteria to identify existing fixtures
      const filter = {
        League: league,
        Season: season,
        Date: row.Date,
        HomeTeam: row.HomeTeam,
        AwayTeam: row.AwayTeam,
      };

      // Define the update document with league and season and other details from the CSV row
      const update = {
        League: league,
        Season: season,
        ...row,
      };

      // Define options for upsert operation
      const upsertOptions = {
        upsert: true, // Perform upsert operation
        new: true, // Return the modified document rather than the original
      };

      // Push the upsert operation into the fixtures array
      fixtures.push(Fixture.updateOne(filter, update, upsertOptions));
    })
    .on('end', async () => {
      try {
        // Execute all upsert operations concurrently using Promise.all
        await Promise.all(fixtures);
        console.log(league + ' ' + season + ' fixtures have been upserted to the database.');
      } catch (error) {
        console.error(`Failed to upsert fixtures: ${error.message}`);
        process.exit(1);
      } finally {
        if (! --totalPromiseCount) {
          // Disconnect from MongoDB after upserting fixtures
          mongoose.disconnect();
        }
      }
    });
}

// Entry point of the script
async function main() {
  totalPromiseCount = 4;
  await upsertFixtures('Premier League', '2018-2019', await fetchCSVFile(CSV_URL_BASE + '1819-E0.csv'));
  await upsertFixtures('Premier League', '2017-2018', await fetchCSVFile(CSV_URL_BASE + '1718-E0.csv'));
  await upsertFixtures('Bundesliga', '2018-2019', await fetchCSVFile(CSV_URL_BASE + '1819-D1.csv'));
  await upsertFixtures('Bundesliga', '2017-2018', await fetchCSVFile(CSV_URL_BASE + '1718-D1.csv'));
}

// Call the main function to start the script
main();
