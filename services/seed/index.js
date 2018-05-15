var Datasource = require('../datasource');

function filterAvailableSeeds(sourceSeeds) {
  var resultSeeds = [];
  sourceSeeds.forEach(sourceSeed => {
    var resultSeed = Datasource.seeds.find(seed =>
      seed.audienceGroupName === sourceSeed.audienceGroup.name
    );
    if (resultSeed) {
      resultSeed.name = sourceSeed.name;
      resultSeeds.push(resultSeed);
    }
  });

  return resultSeeds;
}

module.exports = {
  filterAvailableSeeds: filterAvailableSeeds,
};
