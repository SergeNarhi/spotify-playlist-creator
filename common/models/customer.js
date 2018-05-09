'use strict';
const SpotifyWebApi = require('spotify-web-api-node');
const request = require('request');

// credentials are optional
const spotifyApi = new SpotifyWebApi({
  clientId: '3972abbe8fb6496ca4f60724ac85be47',
  clientSecret: 'd18350faa4d54ef694dde4326e5461e4',
  redirectUri: 'http://localhost:4300',
});

const accessToken = [
  'BQDGOm8iKGO7hCi-RRfcN0OHqEm5IFknZSDyWWp9-FK2BTj1sEdiAGJ174oAMFtjtOIXLPHlxMOSEpAIH6KkHoaxEAkYEjP2DS37uA5G5hbwBOheGOolC6il-9r9yI7yirn29FYF3VIhcukuIWRsZMatmefEkKA9zTKm5j3cC-bhc3s0f_Q35wKjsqKuWEaFnqPMPTffKcPfGUvoVUUuJ0oPtuDk88PptSXzRN8Ayg',
]
  .join('');

const userId = '22ax75yxa77ecwcskbahjgsaa';

spotifyApi.setAccessToken(accessToken);

module.exports = function (Customer) {
  Customer.createPlaylist = (cb) => {

    spotifyApi
      .createPlaylist(
        userId,
        'My Cool Private Playlist',
        {'public': false}
      )
      .then(function (data) {
        console.log('Created playlist!');
        cb(null, data)
      }, function (err) {
        console.log('Something went wrong!', err);
        cb(err)
      });
  };

  Customer.remoteMethod('createPlaylist', {
    accepts: [],
    http: {verb: 'get'},
    returns: [
      {arg: 'data', type: 'object', root: true},
    ],
  });

  // https://accounts.spotify.com/authorize?client_id=3972abbe8fb6496ca4f60724ac85be47&redirect_uri=http://localhost:4300&scope=user-read-private%20user-read-email%20playlist-modify-public%20playlist-modify-private&response_type=token&state=123
  // http://localhost:4300/#access_token=BQDGOm8iKGO7hCi-RRfcN0OHqEm5IFknZSDyWWp9-FK2BTj1sEdiAGJ174oAMFtjtOIXLPHlxMOSEpAIH6KkHoaxEAkYEjP2DS37uA5G5hbwBOheGOolC6il-9r9yI7yirn29FYF3VIhcukuIWRsZMatmefEkKA9zTKm5j3cC-bhc3s0f_Q35wKjsqKuWEaFnqPMPTffKcPfGUvoVUUuJ0oPtuDk88PptSXzRN8Ayg&token_type=Bearer&expires_in=3600&state=123

  Customer.getRecommendations = (cb) => {
    const url = 'https://api.spotify.com/v1/recommendations';

    const options = {
      method: 'GET',
      url: url,
      qs: {
        limit: 100,
        seed_artists: '4NHQUGzhtTLFvgF5SZesLK',
        seed_tracks: '0c6xIDDpzE81m2q797ordA',
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
        }
        cb(err, JSON.parse(body));
      }
    );
  };

  Customer.remoteMethod('getRecommendations', {
    accepts: [],
    http: {verb: 'get'},
    returns: [
      {arg: 'data', type: 'object', root: true},
    ],
  });

  Customer.searchTrack = (cb) => {
    const url = 'https://api.spotify.com/v1/recommendations';

    spotifyApi.searchTracks('"Believer"')
      .then(function (data) {
        console.log('Search by "Love"', data.body);
        cb(null, data.body);
      }, function (err) {
        console.error(err);
        cb(err);
      });
  };

  Customer.remoteMethod('searchTrack', {
    accepts: [],
    http: {verb: 'get'},
    returns: [
      {arg: 'data', type: 'object', root: true},
    ],
  });

  Customer.addTracksToPlaylist = (cb) => {
    const url = 'https://api.spotify.com/v1/recommendations';

    // Add tracks to a playlist
    spotifyApi.addTracksToPlaylist(
      userId,
      '5iRPpMyP7rSyeHB7F2CfwE',
      [
        'spotify:track:5VKSZDsidOFHrtlJb33Syo',
        'spotify:track:3FvV3j98xtcylQF1drDc9j',
      ]
    )
      .then(function (data) {
        console.log('Added tracks to playlist!');
        cb(null, data.body);
      }, function (err) {
        console.log('Something went wrong!', err);
        cb(err);
      });
  };

  Customer.remoteMethod('addTracksToPlaylist', {
    accepts: [],
    http: {verb: 'get'},
    returns: [
      {arg: 'data', type: 'object', root: true},
    ],
  });
};
