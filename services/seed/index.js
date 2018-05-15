var Datasource = require('../datasource');

function isTrack(seed) {
  return seed.type === 'track';
}

function isArtist(seed) {
  return seed.type === 'artist';
}

function isGenre(seed) {
  return seed.type === 'genre';
}

function filterAvailableSeeds(sourceSeeds) {
  var resultSeeds = [];
  sourceSeeds.forEach(sourceSeed => {
    var foundSeed = Datasource.seeds.find(seed =>
      seed.audienceGroupName === sourceSeed.audienceGroup.name
    );
    var resultSeed = Object.assign({}, foundSeed);
    if (foundSeed) {
      resultSeed.name = sourceSeed.name;
      resultSeeds.push(resultSeed);
    }
  });

  return resultSeeds;
}

function calculateSeeds(calculateableSeeds) {
  var tuneable = {};
  var tuneableRes = {};

  calculateableSeeds.forEach(calculateableSeed => {
    Object.keys(calculateableSeed.tuneableAttributes).forEach(attr => {
      if (!tuneable[attr]) {
        tuneable[attr] = {
          sum: 0,
          count: 0,
        }
      }
      tuneable[attr].sum += calculateableSeed.tuneableAttributes[attr];
      tuneable[attr].count++;
    })
  });

  Object.keys(tuneable).forEach(attr => {
    if (tuneable[attr].sum && tuneable[attr].count) {
      tuneableRes[attr] = tuneable[attr].sum / tuneable[attr].count;
    }
  });
  return tuneableRes;
}

module.exports = {
  filterAvailableSeeds: filterAvailableSeeds,
  calculateSeeds: calculateSeeds,
  isTrack: isTrack,
  isArtist: isArtist,
  isGenre: isGenre,
};
