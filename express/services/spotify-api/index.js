var SpotifyWebApi = require('spotify-web-api-node');
var Request = require('request-promise');
var Promise = require('bluebird');
var config = require('../../config')();


const spotifyApi = new SpotifyWebApi(
  {
    clientId: config.spotify.userApp.clientId,
    clientSecret: config.spotify.userApp.clientSecret,
    redirectUri: config.spotify.userApp.redirectUri,
  });

var currentAccessToken = [
  'BQBIDk97ihsBQBxKhbfk7C9yXZY71D4EilxpPoj1O2yI-23Jkfs5f4YclJvWKWeUpM0aN_wJKTmKhfDpxfDmzOZDbPGUn7NETUNwPT4CVzmm5boSN1LJyUt1Ky3dlC_HbdjswlJP8gcLtIfvYYbHSyuuuzd220IFbJci9XVRQFV32fvmMaq1Yga99DCiTMQYPip5fHCw3Q7IGlwpu7FWN3N15DTu5XOvHvIkmKvdPQ',
]
  .join('');

function getDefaultHeaders() {
  return {
    'Authorization': 'Bearer ' + currentAccessToken,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}


function setAccessToken(token) {
  currentAccessToken = token;
  spotifyApi.setAccessToken(currentAccessToken);
}

function createPlaylist(userId, playListName) {
  return new Promise((resolve, reject) => {
    spotifyApi
      .createPlaylist(
        userId,
        playListName
        || config.spotify.defaultPlayListName
        || 'My Cool Playlist',
        { 'public': false },
      )
      .then((res) => {
        resolve(res.body);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getRecommendations(seeds) {
  var TRAKCS_PER_SEED = 5;
  var URL = 'https://api.spotify.com/v1/recommendations';
  var recommendations;

  return new Promise((resolve, reject) => {
    var options = {
      method: 'GET',
      url: URL,
      json: true,
      qs: {
        // better experience with batching
        limit: TRAKCS_PER_SEED * seeds.length,
        'seed_tracks': seeds.filter(seed => seed.type === 'track')
                            .map(seed => seed.id)
                            .join(','),
        'seed_artists': seeds.filter(seed => seed.type === 'artist')
                             .map(seed => seed.id)
                             .join(','),
        'seed_genres': seeds.filter(seed => seed.type === 'genre')
                            .map(seed => seed.id)
                            .join(','),
      },
      headers: getDefaultHeaders(),
    };

    Request(options)
      .then((recommendationsRes) => {
        recommendations = recommendationsRes.tracks.map((track) => track.uri);
        resolve(recommendations);
      })
      .catch((res) => {
        reject(res.error);
      });
  });
}

function searchTrack(name) {
  var track, trackId;
  return new Promise((resolve, reject) => {
    spotifyApi.searchTracks('"' + name + '"', { limit: 1 })
              .then(function (data) {
                trackId = data.body.tracks.items[ 0 ] &&
                          data.body.tracks.items[ 0 ].id;
                track = {
                  id: trackId,
                  name: name,
                  type: 'track',
                };
                resolve(track);
              })
              .catch((err) => {
                reject(err);
              });
  });
}

function searchArtist(name) {
  let artist, artistId;
  return new Promise((resolve, reject) => {
    spotifyApi.searchArtists('"' + name + '"', { limit: 1 })
              .then(function (data) {
                artistId = data.body.artists.items[ 0 ] &&
                           data.body.artists.items[ 0 ].id;
                artist = {
                  id: artistId,
                  name: name,
                  type: 'artist',
                };
                resolve(artist);
              })
              .catch((err) => {
                reject(err);
              });
  });
}

function addTracksToPlaylist(userId, playListId, tracksURIs) {
  return new Promise((resolve, reject) => {
    // Add tracks to a playlist
    spotifyApi.addTracksToPlaylist(
      userId,
      playListId,
      tracksURIs,
    )
              .then((data) => {
                resolve(data.body);
              })
              .catch((err) => {
                reject(err);
              });
  });
}

module.exports = {
  setAccessToken: setAccessToken,
  createPlaylist: createPlaylist,
  getRecommendations: getRecommendations,
  searchTrack: searchTrack,
  searchArtist: searchArtist,
  addTracksToPlaylist: addTracksToPlaylist,
};
