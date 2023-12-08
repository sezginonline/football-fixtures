// Import necessary modules and libraries
const express = require('express');
const mongoose = require('mongoose');
const Fixture = require('./fixture.model');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config(); // Load environment variables from .env file
const redis = require("redis");

// Create an Express application
const app = express();
const port = 3000;

// Connect to Redis
let redisClient;
(async () => {
  redisClient = redis.createClient();
  redisClient.on("error", (error) => console.error(`Error : ${error}`));
  await redisClient.connect();
})();

// Constants
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/football-fixtures';

// Connect to the MongoDB database using the specified URI
mongoose.connect(MONGODB_URI);

// Middleware to parse JSON
app.use(express.json());

// Swagger Options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Football Fixtures API',
      version: '1.0.0',
      description: 'API for football fixtures based on league and season.',
    },
  },
  apis: ['./app.js'], // Specify the path to the main file of your application
};

// Generate Swagger specification using swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /fixtures:
 *   get:
 *     description: Returns fixtures based on league and season.
 *     parameters:
 *       - in: query
 *         name: league
 *         description: The name of the football league. (Premier League or Bundesliga)
 *         required: true
 *         schema:
 *           type: string
 *           default: 'Premier League'
 *       - in: query
 *         name: season
 *         description: The name of the football season. (2018-2019 or 2017-2018)
 *         required: true
 *         schema:
 *           type: string
 *           default: '2018-2019'
 *       - in: query
 *         name: limit
 *         description: The maximum number of fixtures to return. (Default is 15)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 15
 *       - in: query
 *         name: page
 *         description: The page number for paginated results. (Default is 1)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Successful response with the fetched fixtures.
 *       400:
 *         description: Bad request if league or season is missing or invalid values for limit or page.
 *       500:
 *         description: Internal server error.
 */
app.get('/fixtures', async (req, res) => {

  const { league, season, limit = 15, page = 1 } = req.query;

  // Validate input values
  const validLeagues = ['Premier League', 'Bundesliga'];
  const validSeasons = ['2018-2019', '2017-2018'];
  const limitValue = Number(limit);
  const pageValue = Number(page);

  // Warn users about wrong league
  if (!validLeagues.includes(league)) {
    return res.status(400).json({ error: 'Valid leagues are: Premier League or Bundesliga.' });
  }

  // Warn users about wrong season
  if (!validSeasons.includes(season)) {
    return res.status(400).json({ error: 'Valid seasons are: 2018-2019 or 2017-2018.' });
  }

  // Warn users about wrong pagination values
  if (isNaN(limitValue) || limitValue <= 0 || isNaN(pageValue) || pageValue <= 0) {
    return res.status(400).json({ error: 'Invalid or missing parameters.' });
  }

  // Return cached results if available
  const cacheResults = await redisClient.get(JSON.stringify(req.query));
  if (cacheResults) {
    console.log("*** Cached Results ***");
    return res.json(JSON.parse(cacheResults));
  }

  // Query the database for fixtures based on league and season
  const fixtures = await Fixture.find({
    'League': league,
    'Season': season,
  }).skip((pageValue - 1) * limitValue).limit(limitValue);

  // Cache results
  await redisClient.set(JSON.stringify(req.query), JSON.stringify(fixtures));

  // Display fixtures
  console.log("*** No Cache ***");
  res.json(fixtures);

});

// Endpoint to view the Swagger UI
app.get('/', async (req, res) => {
  res.send(`Swagger UI: http://localhost:${port}/api-docs`);
});

// Start the Express server
app.listen(port, () => {
  console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});

// For unit testing
module.exports = app;
