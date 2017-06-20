'use strict';

describe('Controller: CostcenterCtrl', function () {

  // load the controller's module
  beforeEach(module('serviceDeskApp'));

  var CostcenterCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CostcenterCtrl = $controller('CostcenterCtrl', {
      $scope: scope
    });
  }));

  // it('should ...', function () {
  //   expect(1).toEqual(1);
  // });
});
