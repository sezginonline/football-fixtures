const chai = require('chai');
const chaiHttp = require('chai-http');
const { describe, it, beforeEach, after } = require('mocha');
const app = require('../app');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Football Fixtures API', () => {

  describe('GET /fixtures', () => {

    // Should return fixtures based on valid league and season
    it('should return fixtures based on valid league and season', async () => {
      const res = await chai.request(app)
        .get('/fixtures')
        .query({ league: 'Premier League', season: '2018-2019' });

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });

    // Should return 400 for invalid league
    it('should return 400 for invalid league', async () => {
      const res = await chai.request(app)
        .get('/fixtures')
        .query({ league: 'Invalid League', season: '2018-2019' });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('error').to.equal('Valid leagues are: Premier League or Bundesliga.');
    });

    // Should return 400 for invalid season
    it('should return 400 for invalid season', async () => {
      const res = await chai.request(app)
        .get('/fixtures')
        .query({ league: 'Premier League', season: 'Invalid Season' });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('error').to.equal('Valid seasons are: 2018-2019 or 2017-2018.');
    });
  });

  after(() => {
    process.exit();
  });

});
