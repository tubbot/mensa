const getCrowDistance = require('./crow');

const addDistanceField = (userLocation, mensas) => {
  return mensas.map(mensa => {
    mensa.distance = getCrowDistance(userLocation, mensa.coordinates);
    mensa.distance = mensa.distance.toFixed(0);
    return mensa;
  });
};

const helpers = {
  addDistanceField: addDistanceField
};

module.exports = helpers;
