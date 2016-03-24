var app = angular.module('bucket', ['ui.bootstrap']);

app.controller('main', function($scope){

  $scope.name = 'Bucket';
  $scope.start = 10;
  $scope.size = 10;
  $scope.$apply;

});

