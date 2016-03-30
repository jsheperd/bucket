var app = angular.module('bucket', ['ui.bootstrap', 'nvd3ChartDirectives']);


app.controller('main', function ($scope, $http, thorntwaite, thorntwaite_bucket) {

  $scope.name = 'Bucket';
  $scope.start = 10;
  $scope.size = 10;
  $scope.met_data = {};
  $scope.thorntwaite_bucket = thorntwaite_bucket;

  thorntwaite_bucket.init(46.9, 150, "Szoce", 0, 150, 225);
  
 $scope.chart_data = [];
  
  d3.tsv("data/Szoce.txt").get(function (error, rows) {
    $scope.met_data = rows;
    thorntwaite_bucket.calc(rows);

    var format_day = d3.time.format('%Y.%m.%d');
    //console.log($scope.met_data);
    
    var t;
    var t = $scope.met_data.map(function(val, idex, arr){ 
      return [format_day.parse(val.Date), val.T]; 
    });
    
    var p =  $scope.met_data.map(function(val, idex, arr){ 
      return [format_day.parse(val.Date), val.P]; 
    });
    //console.table(t);
    
    $scope.xAxisTickFormatFunction = function() {
       return function(d){
         console.log('d:', d);
        return d3.time.format('%x')(new Date(d));
      }
    }

    $scope.yAxisTickFormatFunction = function(){
      return function(d) {
       return d;
      }
    };
    
    $scope.chart_data.push(
      { key: "Temperature",
        values: t
      },
      { key: "P",
        values: p
      }
    );
     //console.table($scope.chart_data[0].values);
    
    $scope.$apply();
  });

  
});