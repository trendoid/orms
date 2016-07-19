'use strict';

// Quotes controller
angular.module('quotes').controller('QuotesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Quotes',
  function($scope, $stateParams, $location, Authentication, Quotes) {
    $scope.authentication = Authentication;

    // Create new Quote
    $scope.create = function(isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'quoteForm');

        return false;
      }

      // Create new Quote object
      var quote = new Quotes({
        title: this.title,
        content: this.content
      });

      // Redirect after save
      quote.$save(function(response) {
        $location.path('quotes/' + response.id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Quote
    $scope.remove = function(quote) {
      if (quote) {

        quote.$remove();
        $location.path('quotes');
      } else {
        $scope.quote.$remove(function() {
          $location.path('quotes');
        });
      }
    };

    // Update existing Quote
    $scope.update = function(isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'quoteForm');
        return false;
      }

      var quote = $scope.quote;

      quote.$update(function() {
        $location.path('quotes/' + quote.id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Quotes
    $scope.find = function() {
      $scope.quotes = Quotes.query();
    };

    // Find existing Quote
    $scope.findOne = function() {
      $scope.quote = Quotes.get({
        quoteId: $stateParams.quoteId
      });
    };
  }
]);