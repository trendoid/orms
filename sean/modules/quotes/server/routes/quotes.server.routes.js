'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  quotesPolicy = require('../policies/quotes.server.policy'),
  quotes = require(path.resolve('./modules/quotes/server/controllers/quotes.server.controller'));


module.exports = function(app) {

  // Quotes collection routes
  app.route('/api/quotes')
    .all(quotesPolicy.isAllowed)
    .get(quotes.list)
    .post(quotes.create);

  // Single quote routes
  app.route('/api/quotes/:quoteId')
    .all(quotesPolicy.isAllowed)
    .get(quotes.read)
    .put(quotes.update)
    .delete(quotes.delete);

  // Finish by binding the quote middleware
  app.param('quoteId', quotes.quoteByID);

};