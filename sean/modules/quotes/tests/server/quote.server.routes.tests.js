'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Quote = db.quote,
  User = db.user,
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, quote;

/**
 * Quote routes tests
 */
describe('Quote CRUD tests', function() {
  before(function(done) {
    // Get application
    app = express.init(sequelize);
    agent = request.agent(app);

    done();
  });

  before(function(done) {

    // Create user credentials
    credentials = {
      username: 'username',
      password: 'S3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = User.build();

    user.firstName = 'Full';
    user.lastName = 'Name';
    user.displayName = 'Full Name';
    user.email = 'test@test.com';
    user.username = credentials.username;
    user.salt = user.makeSalt();
    user.hashedPassword = user.encryptPassword(credentials.password, user.salt);
    user.provider = 'local';
    user.roles = ['admin', 'user'];

    // Save a user to the test db and create new quote
    user.save().then(function(user) {
      quote = Quote.build();
      quote = {
        title: 'Quote Title',
        content: 'Quote Content',
        userId: user.id
      };
      done();
    }).catch(function(err) {});

  });

  it('should be able to save an quote if logged in', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {

        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new quote
        agent.post('/api/quotes')
          .send(quote)
          .expect(200)
          .end(function(quoteSaveErr, quoteSaveRes) {

            // Handle quote save error
            if (quoteSaveErr) {
              return done(quoteSaveErr);
            }

            // Get a list of quotes
            agent.get('/api/quotes')
              .end(function(quotesGetErr, quotesGetRes) {

                // Handle quote save error
                if (quotesGetErr) {
                  return done(quotesGetErr);
                }

                // Get quotes list
                var quotes = quotesGetRes.body;

                // Set assertions
                console.log('quotes[0]', quotes[0]);
                console.log('userId', userId);

                //(quotes[0].userId).should.equal(userId);
                (quotes[0].title).should.match('Quote Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an quote if not logged in', function(done) {
    agent.get('/api/auth/signout')
      .expect(302) //because of redirect
      .end(function(signoutErr, signoutRes) {

        // Handle signout error
        if (signoutErr) {
          return done(signoutErr);
        }

        agent.post('/api/quotes')
          .send(quote)
          .expect(403)
          .end(function(quoteSaveErr, quoteSaveRes) {
            // Call the assertion callback
            done(quoteSaveErr);
          });
      });
  });

  it('should not be able to save an quote if no title is provided', function(done) {
    // Invalidate title field
    quote.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {

        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new quote
        agent.post('/api/quotes')
          .send(quote)
          .expect(400)
          .end(function(quoteSaveErr, quoteSaveRes) {

            // Set message assertion
            (quoteSaveRes.body.message).should.match('Quote title must be between 1 and 250 characters in length');
            // Handle quote save error
            done(quoteSaveErr);
          });
      });
  });

  it('should be able to update an quote if signed in', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {

        // Handle signin error
        if (!signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new quote
        agent.post('/api/quotes')
          .send(quote)
          .expect(200)
          .end(function(quoteSaveErr, quoteSaveRes) {
            // Handle quote save error
            if (quoteSaveErr) {
              return done(quoteSaveErr);
            }

            // Update quote title
            quote.title = 'WHY YOU GOTTA BE SO SEAN?';

            // Update an existing quote
            agent.put('/api/quotes/' + quoteSaveRes.body.id)
              .send(quote)
              .expect(200)
              .end(function(quoteUpdateErr, quoteUpdateRes) {
                // Handle quote update error
                if (quoteUpdateErr) {
                  return done(quoteUpdateErr);
                }

                // Set assertions
                (quoteUpdateRes.body.id).should.equal(quoteSaveRes.body.id);
                (quoteUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO SEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of quotes if not signed in', function(done) {
    quote.title = 'Quote Title';
    // Create new quote model instance
    var quoteObj = Quote.build(quote);

    // Save the quote
    quoteObj.save().then(function() {
      // Request quotes
      request(app).get('/api/quotes')
        .end(function(req, res) {

          // Set assertion
          //res.body.should.be.instanceof(Array).and.have.lengthOf(1);
          res.body.should.be.instanceof(Array);
          // Call the assertion callback
          done();
        });

    }).catch(function(err) {});
  });

  it('should be able to get a single quote if not signed in', function(done) {
    // Create new quote model instance
    var quoteObj = Quote.build(quote);

    // Save the quote
    quoteObj.save().then(function() {
      request(app).get('/api/quotes/' + quoteObj.id)
        .end(function(req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', quote.title);

          // Call the assertion callback
          done();
        });
    }).catch(function(err) {});
  });

  it('should return proper error for single quote with an invalid Id, if not signed in', function(done) {
    // test is not a valid mongoose Id
    request(app).get('/api/quotes/test')
      .end(function(req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Quote is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single quote which doesnt exist, if not signed in', function(done) {
    // This is a valid mongoose Id but a non-existent quote
    request(app).get('/api/quotes/123567890')
      .end(function(req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No quote with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an quote if signed in', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {

        // Handle signin error
        if (!signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new quote
        agent.post('/api/quotes')
          .send(quote)
          .expect(200)
          .end(function(quoteSaveErr, quoteSaveRes) {


            // Handle quote save error
            if (quoteSaveErr) {
              return done(quoteSaveErr);
            }

            // Delete an existing quote
            agent.delete('/api/quotes/' + quoteSaveRes.body.id)
              .send(quote)
              .expect(200)
              .end(function(quoteDeleteErr, quoteDeleteRes) {

                // Handle quote error error
                if (quoteDeleteErr) {
                  return done(quoteDeleteErr);
                }

                // Set assertions
                (quoteDeleteRes.body.id).should.equal(quoteSaveRes.body.id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an quote if not signed in', function(done) {
    // Set quote user
    quote.userId = user.id;

    // Create new quote model instance
    var quoteObj = Quote.build(quote);

    // Save the quote
    quoteObj.save().then(function() {
      // Try deleting quote
      request(app).delete('/api/quotes/' + quoteObj.id)
        .expect(403)
        .end(function(quoteDeleteErr, quoteDeleteRes) {

          // Set message assertion
          (quoteDeleteRes.body.message).should.match('User is not authorized');

          // Handle quote error error
          done(quoteDeleteErr);
        });

    }).catch(function(err) {});
  });

  after(function(done) {
    user.destroy()
      .then(function(success) {
        done();
      }).catch(function(err) {});
  });

});