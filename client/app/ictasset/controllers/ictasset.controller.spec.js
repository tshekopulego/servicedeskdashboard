'use strict';

describe('Controller: ICTAssetCtrl', function () {

  // load the controller's module
  beforeEach(module('serviceDeskApp'));

  var ICTAssetCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ICTAssetCtrl = $controller('ICTAssetCtrl', {
      $scope: scope
    });
  }));

  // it('should ...', function () {
  //   expect(1).toEqual(1);
  // });
});