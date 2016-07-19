'use strict';

// Configuring the Quotes module
angular.module('quotes').run(['Menus',
  function(Menus) {
    // Add the quotes dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Quotes',
      state: 'quotes',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'quotes', {
      title: 'List Quotes',
      state: 'quotes.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'quotes', {
      title: 'Create Quotes',
      state: 'quotes.create',
      roles: ['user']
    });
  }
]);