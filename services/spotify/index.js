var SpotifyApi = require('../spotify-api/index');
var CommonUtils = require('../../lib/utils');
var SeedsService = require('../seed');
var Promise = require('bluebird');

function filterAvailableSeeds(seeds) {
  return seeds.filter(
    sourceSeed => {
      return SeedsService.isTrack(sourceSeed) ||
        SeedsService.isArtist(sourceSeed) ||
        SeedsService.isGenre(sourceSeed);
    });
}

function searchSeedId(sourceSeeds) {
  return Promise.map(sourceSeeds, (sourceSeed) => {
    if (SeedsService.isTrack(sourceSeed)) {
      return SpotifyApi.searchTrack(sourceSeed);
    } else if (SeedsService.isArtist(sourceSeed)) {
      return SpotifyApi.searchArtist(sourceSeed);
    } else if (SeedsService.isGenre(sourceSeed)) {
      sourceSeed.id = sourceSeed.name.toLowerCase()
        .replace(' ', '-')
      return sourceSeed;
    } else {
      return sourceSeed;
    }
  });
}

function getRecommendationsBatched(seeds) {
  var recommendations;
  var calculateableSeeds = seeds.filter(seed => seed.calculateable);
  var uncalculateableSeeds = seeds.filter(seed => !seed.calculateable);
  var tuneableAttributes = SeedsService.calculateSeeds(calculateableSeeds);
  var chunkedSeeds = CommonUtils.chunkArray(uncalculateableSeeds, 5);
  return new Promise((resolve, reject) => {
    Promise.map(chunkedSeeds, seedsChunk => {
      return SpotifyApi.getRecommendations(seedsChunk, tuneableAttributes);
    })
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
    sourceSeeds = SeedsService.filterAvailableSeeds(sourceSeeds);

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
