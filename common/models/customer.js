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
  'BQBuscPdC7vRMlSlNck_dye9E-Kf-hnpxI162WYXsdl94lgvFcXjNt3Owy',
  'C06Dtg_u8vVYJECLO2zSDn2Pnp5TyZIaZ_fledh3duTr-EgbF7GMus9OGC',
  'j3cbnODn7dHc5IqrD34Y0SXqSzBST12-mSl5ue3hcLkTmPvt6xcpnKwH6D',
  'XvRvdwNU6kHeclRO5DZ0CKUdglnF2SOBNlI_oyxba9CxoqwEzaXB7jmlnhxA',
]
  .join('')

spotifyApi.setAccessToken(accessToken);

module.exports = function (Customer) {
  Customer.createPlaylist = (cb) => {

    spotifyApi
      .createPlaylist(
        '22ax75yxa77ecwcskbahjgsaa',
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
  // http://localhost:4300/#access_token=BQBuscPdC7vRMlSlNck_dye9E-Kf-hnpxI162WYXsdl94lgvFcXjNt3OwyC06Dtg_u8vVYJECLO2zSDn2Pnp5TyZIaZ_fledh3duTr-EgbF7GMus9OGCj3cbnODn7dHc5IqrD34Y0SXqSzBST12-mSl5ue3hcLkTmPvt6xcpnKwH6DXvRvdwNU6kHeclRO5DZ0CKUdglnF2SOBNlI_oyxba9CxoqwEzaXB7jmlnhxA&token_type=Bearer&expires_in=3600&state=123


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
};
