if (!Number.prototype.toRadians) {
  Number.prototype.toRadians = function() {
    return this * Math.PI / 180;
  };
}

const crow = (userLocation, mensaLocation) => {
  var lat1 = Number(userLocation[0]);
  var lon1 = Number(userLocation[1]);
  var lat2 = Number(mensaLocation[0]);
  var lon2 = Number(mensaLocation[1]);
  // From "Movable Type Scripts"
  var R = 6371e3; // metres
  var φ1 = lat1.toRadians();
  var φ2 = lat2.toRadians();
  var Δφ = (lat2-lat1).toRadians();
  var Δλ = (lon2-lon1).toRadians();
  var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d;
};

module.exports = crow;
