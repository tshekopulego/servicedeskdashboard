'use strict';

describe('Controller: AssettypeCtrl', function () {

  // load the controller's module
  beforeEach(module('serviceDeskApp'));

  var AssettypeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AssettypeCtrl = $controller('AssettypeCtrl', {
      $scope: scope
    });
  }));

  // it('should ...', function () {
  //   expect(1).toEqual(1);
  // });
});
