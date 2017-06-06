'use strict';

describe('Controller: IssueStatusCtrl', function () {

  // load the controller's module
  beforeEach(module('serviceDeskApp'));

  var IssueStatusCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    IssueStatusCtrl = $controller('IssueStatusCtrl', {
      $scope: scope
    });
  }));

  // it('should ...', function () {
  //   expect(1).toEqual(1);
  // });
});
