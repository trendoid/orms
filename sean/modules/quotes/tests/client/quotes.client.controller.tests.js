'use strict';

(function() {
  // Quotes Controller Spec
  describe('Quotes Controller Tests', function() {
    // Initialize global variables
    var QuotesController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Quotes,
      mockQuote;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function() {
      jasmine.addMatchers({
        toEqualData: function(util, customEqualityTesters) {
          return {
            compare: function(actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Quotes_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Quotes = _Quotes_;

      // create mock quote
      mockQuote = new Quotes({
        id: '525a8422f6d0f87f0e407a33',
        title: 'An Quote about SEANJS',
        content: 'SEANJS rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Quotes controller.
      QuotesController = $controller('QuotesController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one quote object fetched from XHR', inject(function(Quotes) {
      // Create a sample quotes array that includes the new quote
      var sampleQuotes = [mockQuote];

      // Set GET response
      $httpBackend.expectGET('api/quotes').respond(sampleQuotes);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.quotes).toEqualData(sampleQuotes);
    }));

    it('$scope.findOne() should create an array with one quote object fetched from XHR using a quoteId URL parameter', inject(function(Quotes) {
      // Set the URL parameter
      $stateParams.quoteId = mockQuote.id;

      // Set GET response
      $httpBackend.expectGET(/api\/quotes\/([0-9a-fA-F]{24})$/).respond(mockQuote);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.quote).toEqualData(mockQuote);
    }));

    describe('$scope.create()', function() {
      var sampleQuotePostData;

      beforeEach(function() {
        // Create a sample quote object
        sampleQuotePostData = new Quotes({
          title: 'An Quote about SEANJS',
          content: 'SEANJS rocks!'
        });

        // Fixture mock form input values
        scope.title = 'An Quote about SEANJS';
        scope.content = 'SEANJS rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function(Quotes) {
        // Set POST response
        $httpBackend.expectPOST('api/quotes', sampleQuotePostData).respond(mockQuote);

        // Run controller functionality
        scope.create(true);
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the quote was created
        expect($location.path.calls.mostRecent().args[0]).toBe('quotes/' + mockQuote.id);
      }));

      it('should set scope.error if save error', function() {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/quotes', sampleQuotePostData).respond(400, {
          message: errorMessage
        });

        scope.create(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      });
    });

    describe('$scope.update()', function() {
      beforeEach(function() {
        // Mock quote in scope
        scope.quote = mockQuote;
      });

      it('should update a valid quote', inject(function(Quotes) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/quotes\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/quotes/' + mockQuote.id);
      }));

      it('should set scope.error to error response message', inject(function(Quotes) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/quotes\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(quote)', function() {
      beforeEach(function() {
        // Create new quotes array and include the quote
        scope.quotes = [mockQuote, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/quotes\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockQuote);
      });

      it('should send a DELETE request with a valid quoteId and remove the quote from the scope', inject(function(Quotes) {
        expect(scope.quotes.length).toBe(2); //Because of the empty object - must be 1
      }));
    });

    describe('scope.remove()', function() {
      beforeEach(function() {
        spyOn($location, 'path');
        scope.quote = mockQuote;

        $httpBackend.expectDELETE(/api\/quotes\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to quotes', function() {
        expect($location.path).toHaveBeenCalledWith('quotes');
      });
    });
  });
}());