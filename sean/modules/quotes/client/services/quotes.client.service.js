'use strict';

//Quotes service used for communicating with the quotes REST endpoints
angular.module('quotes').factory('Quotes', ['$resource',
  function($resource) {
    return $resource('api/quotes/:quoteId', {
      quoteId: '@id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);