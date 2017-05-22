'use strict';

describe('Controller: PriorityCtrl', function () {

  // load the controller's module
  beforeEach(module('serviceDeskApp'));

  var PriorityCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PriorityCtrl = $controller('PriorityCtrl', {
      $scope: scope
    });
  }));

  // it('should ...', function () {
  //   expect(1).toEqual(1);
  // });
});
