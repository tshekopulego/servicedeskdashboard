'use strict';

describe('Controller: DivisionCtrl', function () {

  // load the controller's module
  beforeEach(module('serviceDeskApp'));

  var DivisionCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DivisionCtrl = $controller('DivisionCtrl', {
      $scope: scope
    });
  }));

  // it('should ...', function () {
  //   expect(1).toEqual(1);
  // });
});
