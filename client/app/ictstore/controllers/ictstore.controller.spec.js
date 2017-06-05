'use strict';

describe('Controller: ICTStoreCtrl', function () {

  // load the controller's module
  beforeEach(module('serviceDeskApp'));

  var ICTStoreCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ICTStoreCtrl = $controller('ICTStoreCtrl', {
      $scope: scope
    });
  }));

  // it('should ...', function () {
  //   expect(1).toEqual(1);
  // });
});