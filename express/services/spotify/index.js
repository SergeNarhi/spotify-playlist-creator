var SpotifyApi = require('../spotify-api');
var CommonUtils = require('../../lib/utils');
var Promise = require('bluebird');

function isTrack(seed) {
  return seed.audienceGroup.name === 'Songs';
}

function isArtist(seed) {
  return seed.audienceGroup.name === 'Celebrities';
}

function isGenre(seed) {
  return seed.audienceGroup.name === 'Music Genre';
}

function filterAvailableSeeds(seeds) {
  return seeds.filter(
    sourceSeed => {
      return isTrack(sourceSeed) ||
             isArtist(sourceSeed) ||
             isGenre(sourceSeed);
    });
}

function searchSeedId(sourceSeeds) {
  return Promise.map(sourceSeeds, (sourceSeed) => {
    if (isTrack(sourceSeed)) {
      return SpotifyApi.searchTrack(sourceSeed.name);
    } else if (isArtist(sourceSeed)) {
      return SpotifyApi.searchArtist(sourceSeed.name);
    } else if (isGenre(sourceSeed)) {
      return {
        id: sourceSeed.name.toLowerCase()
                      .replace(' ', '-'),
        name: sourceSeed.name,
        type: 'genre',
      };
    }
  });
}

function getRecommendationsBatched(seeds) {
  let recommendations;
  let chunkedSeeds = CommonUtils.chunkArray(seeds, 5);
  return new Promise((resolve, reject) => {
    Promise.map(chunkedSeeds, SpotifyApi.getRecommendations)
           .then((batchedRecommendations) => {
             recommendations = [].concat.apply([], batchedRecommendations);
             resolve(recommendations);
           })
           .catch((err) => {
             reject(err);
           });
  });
}

function addRecommendationsBySeeds(userId, sourceSeeds, accessToken) {
  var playlist, seeds, recommendationsLength;

  return new Promise((resolve, reject) => {
    SpotifyApi.setAccessToken(accessToken);
    sourceSeeds = filterAvailableSeeds(sourceSeeds);

    SpotifyApi.createPlaylist(userId)
              .then((playlistRes) => {
                playlist = playlistRes;
                return searchSeedId(sourceSeeds);
              })
              .then((seedsRes) => {
                seeds = seedsRes;
                return getRecommendationsBatched(seeds);
              })
              .then((recommendations) => {
                recommendationsLength = recommendations.length;
                return SpotifyApi
                  .addTracksToPlaylist(
                    userId,
                    playlist.id,
                    recommendations,
                  );
              })
              .then(() => {
                resolve(
                  {
                    results: 'done',
                    tracksAdded: recommendationsLength,
                  });
              })
              .catch((err) => {
                console.log(err);
                reject(err);
              });
  });
}


module.exports = {
  addRecommendationsBySeeds: addRecommendationsBySeeds,
};
