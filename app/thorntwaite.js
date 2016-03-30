var app = angular.module('bucket');

app.service('thorntwaite', function () {
  var self = this;
  //var self.

  self.dayLength = function (lat, month) {
    // Given a location and date, calculate the length of the day in hours
    // For details see http://en.wikipedia.org/wiki/Insolation

    // Orbital parameters
    var ecc = 0.0167; // Eccentricity of Earth's orbit
    var eps = 0.4091; // Obliquity (tilt) of Eart's axis (radians)
    var perih = 1.7963; // Angle between March equinox & perihelion (radians)
    var equinox = 81; // Day of the year when March equinox occurs    
    var theta, dec, arg, h0, daynum;
    var nDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // nDays is the number of days in each month


    // find the day of the year at mid-month
    daynum = 0; // count days starting with zero
    for (var i = 1; i < month; i++) { // Month is 1 based
      daynum += nDays[i - 1];
    }
    daynum += 15;

    // Theta is the position angle of the Earth in its orbit, 
    // counted in radians starting at the Vernal Equinox (March 22)
    //     theta=0 is the March Equinox, theta=90 is June Solstice
    //     theta=180 is September Equinox, theta=270 is December Solstice)
    theta = 2 * Math.PI * (daynum - equinox) / 365;

    // Convert latitude from degrees to radians
    lat = lat * Math.PI / 180.;

    // Declination for this time of year (theta)
    // declination is the latitude where the Sun is directly overhead @ noon
    dec = eps * Math.sin(theta);

    // Hour angle at sunrise & sunset
    arg = Math.tan(lat) * Math.tan(dec);

    if (arg > 1) {
      h0 = Math.PI; // perpetual summer daylight
    } else if (arg < -1) {
      h0 = 0;
    } // perpetual winter darkness
    else {
      h0 = Math.acos(-arg) // normal sunrise/sunset
    }


    // Daylength is elapsed time between sunrise and sunset, in hours
    angular_daylength = 2 * h0;
    daylength_hours = 24 * angular_daylength / (2 * Math.PI);

    return (daylength_hours)

  };

  self.mPET = function (mT, lat) {
    var I_thorn, a_power;
    var day_Length = [];
    var nDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // nDays is the number of days in each month

    // Use Thorthwaite (1948) relationship to calculate monthly potential evapotranspiration
    // This is Bonan's equation 11.1 and 11.2, page 161

    // input array is monthly mean temperature (Celsius), 
    //  an array of 12 values from January to December

    // second input is latitude

    // Only consider temperatures above freezing
    mT = mT.map(function (d) {
      return Math.max(0, d);
    })

    // First sum a power of (positive) monthly temps to get Thornthwait's "I" value
    I_thorn = mT.map(function (d) {
      return Math.pow((d / 5.), 1.514);
    });
    I_thorn = I_thorn.reduce(function (a, b) {
      return a + b;
    });

    // Now calculate Thornthwait 's exponent "a" (Bonan Eq 11.2)
    a_power = 6.75e-7 * Math.pow(I_thorn, 3) - 7.71e-5 * I_thorn * I_thorn + 1.79e-2 * I_thorn + 0.49;
    // Calaulcate the average daylength( in hours) for each month
    day_Length = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (m) {
      return self.dayLength(lat, m);
    });

    console.log(day_Length);
    // Finally, calculate the potential evapotranspiration(PET) for each month# This is Bonan 's equation 11.1
    //PET = 16 * (day_Length / 12) * (Ndays / 30) * (10 * monthly_temp / I) ^ a_power;
    var PET = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (i) {
      console.log(day_Length[i], nDays[i], mT[i])
      return 16 * day_Length[i] / 12 * (nDays[i] / 30) * Math.pow((10 * mT[i] / I_thorn), a_power);
    });

    // Send the PET array back as the output
    return (PET)
  };
});