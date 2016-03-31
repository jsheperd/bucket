var app = angular.module('bucket', ['ui.bootstrap', 'nvd3']);


app.controller('main', function ($scope, $http, thorntwaite, thorntwaite_bucket) {

  $scope.name = 'Bucket';
  $scope.start = 10;
  $scope.size = 10;
  $scope.met_data = {};
  $scope.thorntwaite_bucket = thorntwaite_bucket;

  thorntwaite_bucket.init(46.9, 150, "Szőce", 0, 150, 225);

  $scope.chart_data = [];

  d3.tsv("data/Szoce.txt").get(function (error, rows) {
    $scope.met_data = rows;
    thorntwaite_bucket.calc(rows);

    var format_day = d3.time.format('%Y.%m.%d');
    //console.log($scope.met_data);

    var t = $scope.met_data.map(function (val, idex, arr) {
      return {
        x: format_day.parse(val.Date),
        y: val.T
      };
    });

    var p = $scope.met_data.map(function (val, idex, arr) {
      return {
        x: format_day.parse(val.Date),
        y: val.P
      };
    });

    var w = $scope.met_data.map(function (val, idex, arr) {
      return {
        x: format_day.parse(val.Date),
        y: val.W
      };
    });


    $scope.chart_data.push({
      key: "Monthly P",
      color: "lightblue",
      area: true,
      values: p
    });

    $scope.chart_data.push({
      key: "Temperature",
      color: "#2255aa",
      values: t
    });

    $scope.chart_data.push({
      key: "Monthly W",
      color: "green",
      values: w
    });



    $scope.$apply();
    var ref = $scope.api.refresh;
    setTimeout(ref, 2000);
  });

  $scope.xAxisTickFormatFunction = function () {
    return function (d) {
      return d3.time.format('%x')(new Date(d));
    }
  }

  $scope.yAxisTickFormatFunction = function () {
    return function (d) {
      return d;
    }
  };


  $scope.options = {
    chart: {
      type: 'lineChart',
      height: 350,
      width: 550,
      margin: {
        left: 80,
        right: 10,
        top: 20,
        bottom: 120
      },
      duration: 500,
      x: function (d) {
        return d.x;
      },
      y: function (d) {
        return d.y;
      },
      xAxis: {
        tickFormat: function (d) {
          return d3.time.format('%x')(new Date(d))
        },
        rotateLabels: 60,
        showMaxMin: true
      },
      yAxis: {
        tickFormat: function (d) {
          return d3.format(',.1f')(d);
        }
      },
      zoom: {
        enabled: true,
        scaleExtent: [1, 10],
        useFixedDomain: false,
        useNiceScale: false,
        horizontalOff: false,
        verticalOff: true,
        unzoomEventType: 'dblclick.zoom'
      }
    }
  };

});