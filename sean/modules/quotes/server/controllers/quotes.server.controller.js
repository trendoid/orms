'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Quote = db.quote;

/**
 * Create a quote
 */
exports.create = function(req, res) {

  req.body.userId = req.user.id;

  Quote.create(req.body).then(function(quote) {
    if (!quote) {
      return res.send('users/signup', {
        errors: 'Could not create the quote'
      });
    } else {
      return res.jsonp(quote);
    }
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Show the current quote
 */
exports.read = function(req, res) {
  res.json(req.quote);
};

/**
 * Update a quote
 */
exports.update = function(req, res) {
  var quote = req.quote;

  quote.updateAttributes({
    title: req.body.title,
    content: req.body.content
  }).then(function(quote) {
    res.json(quote);
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Delete an quote
 */
exports.delete = function(req, res) {
  var quote = req.quote;

  // Find the quote
  Quote.findById(quote.id).then(function(quote) {
    if (quote) {

      // Delete the quote
      quote.destroy().then(function() {
        return res.json(quote);
      }).catch(function(err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      });

    } else {
      return res.status(400).send({
        message: 'Unable to find the quote'
      });
    }
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });

};

/**
 * List of Quotes
 */
exports.list = function(req, res) {
  Quote.findAll({
    include: [db.user]
  }).then(function(quotes) {
    if (!quotes) {
      return res.status(404).send({
        message: 'No quotes found'
      });
    } else {
      res.json(quotes);
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};

/**
 * Quote middleware
 */
exports.quoteByID = function(req, res, next, id) {

  if ((id % 1 === 0) === false) { //check if it's integer
    return res.status(404).send({
      message: 'Quote is invalid'
    });
  }

  Quote.find({
    where: {
      id: id
    },
    include: [{
      model: db.user
    }]
  }).then(function(quote) {
    if (!quote) {
      return res.status(404).send({
        message: 'No quote with that identifier has been found'
      });
    } else {
      req.quote = quote;
      next();
    }
  }).catch(function(err) {
    return next(err);
  });

};