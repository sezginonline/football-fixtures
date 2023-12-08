# Football Fixtures

### Setup

Clone the repository:

```
git clone https://github.com/sezginonline/football-fixtures.git
```

`Optional:` To configure MongoDB connection, create an `.env` file in the root directory based on the `.env.example` file provided.

### Requirements

- Node.js (https://nodejs.org/)
- MongoDB (https://www.mongodb.com/)
- Redis (https://redis.io/)

MongoDB and Redis can be installed and launched via Docker:

```
docker-compose up -d
```

## CLI Command

1. Install dependencies:

```
npm install
```

2. Make the `cli.js` script executable:

```
chmod +x cli.js
```

3. To fetch data and save them to `fixtures` collection in MongoDB:

```
npm run fetch
```

## REST API

Running the API:

```
npm start
```

`Swagger UI` will be accessible at http://localhost:3000/api-docs

## UNIT TESTS

Running unit tests:

```
npm test
```
