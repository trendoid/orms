'use strict';

// Setting up route
angular.module('quotes').config(['$stateProvider',
  function($stateProvider) {
    // Quotes state routing

    $stateProvider
      .state('quotes', {
        abstract: true,
        url: '/quotes',
        template: '<ui-view/>'
      })
      .state('quotes.list', {
        url: '',
        templateUrl: 'modules/quotes/client/views/list-quotes.client.view.html'
      })
      .state('quotes.create', {
        url: '/create',
        templateUrl: 'modules/quotes/client/views/create-quote.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('quotes.view', {
        url: '/:quoteId',
        templateUrl: 'modules/quotes/client/views/view-quote.client.view.html'
      })
      .state('quotes.edit', {
        url: '/:quoteId/edit',
        templateUrl: 'modules/quotes/client/views/edit-quote.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);