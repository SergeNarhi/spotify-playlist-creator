'use strict';

const SpotifyWebApi = require('spotify-web-api-node');
const request = require('request');
const app = require('../../server/server');
const Promise = require('bluebird');

const BASE_URL = 'https://api.spotify.com';

const spotifyApi = new SpotifyWebApi({
  clientId: app.get('spotify').userApp.clientId,
  clientSecret: app.get('spotify').userApp.clientSecret,
  redirectUri: app.get('spotify').userApp.redirectUri,
});

function createPlaylist(userId, playListName, isPublic = false) {
  return spotifyApi
    .createPlaylist(
      userId,
      playListName,
      {'public': isPublic}
    );
}

function getRecommendations(accessToken, seeds) {
  const methodPath = '/v1/recommendations';
  const url = BASE_URL + methodPath;

  return new Promise((resolve, reject) => {

    const options = {
      method: 'GET',
      url: url,
      qs: {
        limit: 100,
        'seed_artists': '4NHQUGzhtTLFvgF5SZesLK',
        'seed_tracks': '0c6xIDDpzE81m2q797ordA',
      },
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };
    request(
      options,
      function (err, data, body) {
        if (err) {
          console.error(err);
          return reject(err);
        }
        resolve(JSON.parse(body));
      }
    );
  })
}

module.exports = {
  createPlaylist: createPlaylist,
  getRecommendations: getRecommendations,
};
