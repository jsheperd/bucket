var app = angular.module('bucket');




app.service('thorntwaite_bucket', function () {
  var self = this;

  self.init = function (lat, soil_depth, location_name, pack, soil, soil_max) {
    self.lat = lat;
    self.lat_rad = 2 * Math.PI * lat / 360.0;
    self.soil_depth = soil_depth;
    self.location_name = location_name || "";
    self.pack = pack || 0;
    self.soil = soil || 0;
    self.soil_max = soil_max || 0;
    self.intercept = [5, 5, 15, 20, 20, 20, 20, 20, 20, 15, 15, 5];
    self.declination_deg = [-21.3, -13.3, -2.0, 9.8, 18.9, 23.3, 21.3, 13.7, 3.0, -9.0, -18.6, -23.3];

    self.declination_rad = self.declination_deg.map(function (item) {
      return (2 * Math.PI * item / 360.0)
    });
    self.daylength = self.declination_rad.map(function (item) {
      return 2 * Math.acos(-Math.tan(item) * Math.tan(self.lat_rad)) / 0.2618;
    });
  };

  self.calc = function (met) { // met = {date, temp, percip} -> 
    // met = {date, temp, percip, percip_minus_intercept, f, rain, snow, pack, melt, w, pet, w_pet, soil, rew_perc, hat_soil, et, w_et_hat_soil}
    
    //console.table(met);
    
    var month = 0;
    var intercept_mm;
    var f;
    var prev_pack;
    var prev_soil;
    var PET;

    for (index in met) {
      month = index % 12;
      met[index].P = +met[index].P;
      met[index].T = +met[index].T;
      intercept_mm = met[index].P * self.intercept[month] / 100.0;
      met[index].p_minus_i = met[index].P - intercept_mm;
      met[index].f = Math.min(1.0, Math.max(0.0, (+met[index].T + 3) * 1 / 6)); //remap T(-3, 3) => (0 - 1)
      met[index].rain = met[index].p_minus_i * met[index].f;
      met[index].snow = met[index].p_minus_i * (1 - met[index].f);
      if (index == 0) {
        prev_pack = self.pack;
      } else {
        prev_pack = met[index - 1].pack;
      }
      met[index].pack = (1 - met[index].f) * (1 - met[index].f) * met[index].p_minus_i + (1 - met[index].f) * prev_pack;
      met[index].melt = met[index].f * (prev_pack + met[index].snow);
      met[index].W = met[index].melt + met[index].rain;
      met[index].PET = (met[index].T > 5) ? 924 * self.daylength[month] * 0.611 * Math.exp(17.3 * met[index].T / (met[index].T + 237.3)) / (met[index].T + 273.2) : 0;
      met[index].W_minus_PET = met[index].W - met[index].PET;
      if (index == 0) {
        prev_soil = self.soil;
      } else {
        prev_soil = met[index - 1].soil;
      }
      
      if (met[index].W > met[index].PET) {
        met[index].soil = Math.min(met[index].W_minus_PET + prev_soil, self.soil_max);
      } else {
        met[index].soil = prev_soil*Math.exp(-(met[index].PET-met[index].W)/self.soil_max); 
      }

      met[index].REW = ( met[index].soil / self.soil_max )*100.0;
      met[index].up_soil =  met[index].soil - prev_soil;
      met[index].ET = (met[index].W > met[index].PET) ? met[index].PET : met[index].W + prev_soil - met[index].soil;
      met[index].W_minus_ET_minus_up_soil = (met[index].W) - (met[index].ET) - (met[index].up_soil);
    }
  }
});