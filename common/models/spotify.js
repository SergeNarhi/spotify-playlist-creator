'use strict';
const SpotifyWebApi = require('spotify-web-api-node');
const request = require('request-promise');
const app = require('../../server/server');
const Promise = require('bluebird');

const spotifyApi = new SpotifyWebApi({
                                       clientId: app.get('spotify').userApp.clientId,
                                       clientSecret: app.get('spotify').userApp.clientSecret,
                                       redirectUri: app.get('spotify').userApp.redirectUri,
                                     });

let currentAccessToken = [
  'BQBIDk97ihsBQBxKhbfk7C9yXZY71D4EilxpPoj1O2yI-23Jkfs5f4YclJvWKWeUpM0aN_wJKTmKhfDpxfDmzOZDbPGUn7NETUNwPT4CVzmm5boSN1LJyUt1Ky3dlC_HbdjswlJP8gcLtIfvYYbHSyuuuzd220IFbJci9XVRQFV32fvmMaq1Yga99DCiTMQYPip5fHCw3Q7IGlwpu7FWN3N15DTu5XOvHvIkmKvdPQ',
]
  .join('');

const USER_ID = '22ax75yxa77ecwcskbahjgsaa';

spotifyApi.setAccessToken(currentAccessToken);

function setAccessToken(token) {
  currentAccessToken = token;
  spotifyApi.setAccessToken(currentAccessToken);
}

function chunkArray(sourceArray, chunkMaxLength) {
  let chunks = [],
    i = 0,
    n = sourceArray.length;
  while (i < n) {
    chunks.push(sourceArray.slice(i, i += chunkMaxLength));
  }
  return chunks;
}


// https://accounts.spotify.com/authorize?client_id=3972abbe8fb6496ca4f60724ac85be47&redirect_uri=http://localhost:4300&scope=user-read-private%20user-read-email%20playlist-modify-public%20playlist-modify-private&response_type=token&state=123
// http://localhost:4300/#access_token=BQBIDk97ihsBQBxKhbfk7C9yXZY71D4EilxpPoj1O2yI-23Jkfs5f4YclJvWKWeUpM0aN_wJKTmKhfDpxfDmzOZDbPGUn7NETUNwPT4CVzmm5boSN1LJyUt1Ky3dlC_HbdjswlJP8gcLtIfvYYbHSyuuuzd220IFbJci9XVRQFV32fvmMaq1Yga99DCiTMQYPip5fHCw3Q7IGlwpu7FWN3N15DTu5XOvHvIkmKvdPQ&token_type=Bearer&expires_in=3600&state=123

module.exports = function (Spotify) {
  Spotify.createPlaylist = (userId, playListName) => {
    return new Promise((resolve, reject) => {
      spotifyApi
        .createPlaylist(
          userId,
          playListName || 'My Cool Playlist',
          { 'public': false },
        )
        .then((res) => {
          resolve(res.body);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  Spotify.getRecommendations = (seeds) => {
    const TRAKCS_PER_SEED = 5;
    const url = 'https://api.spotify.com/v1/recommendations';
    let recommendations;

    return new Promise((resolve, reject) => {
      const options = {
        method: 'GET',
        url: url,
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
        headers: {
          'Authorization': 'Bearer ' + currentAccessToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      };
      request(options)
        .then((recommendationsRes) => {
          recommendations = recommendationsRes.tracks.map((track) => track.uri);
          resolve(recommendations);
        })
        .catch((res) => {
          reject(res.error);
        });
    });
  };

  Spotify.getRecommendationsBatched = (seeds) => {
    let recommendations;
    let chunkedSeeds = chunkArray(seeds, 5);
    return new Promise((resolve, reject) => {
      Promise.map(chunkedSeeds, Spotify.getRecommendations)
             .then((batchedRecommendations) => {
               recommendations = [].concat.apply([], batchedRecommendations);
               resolve(recommendations);
             })
             .catch((err) => {
               reject(err);
             });
    });
  };


  Spotify.searchTrack = (name) => {
    let track, trackId;
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
  };

  Spotify.searchArtist = (name) => {
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
  };


  Spotify.searchSeedId = (sourceSeeds) => {
    return Promise.map(sourceSeeds, (sourceSeed) => {
      if (sourceSeed.audienceGroup.name === 'Track' ||
          sourceSeed.audienceGroup.name === 'Songs') {
        return Spotify.searchTrack(sourceSeed.name);
      } else if (sourceSeed.audienceGroup.name === 'Artist' ||
                 sourceSeed.audienceGroup.name === 'Celebrities') {
        return Spotify.searchArtist(sourceSeed.name);
      } else if (sourceSeed.audienceGroup.name === 'Genre' ||
                 sourceSeed.audienceGroup.name === 'Music Genre') {
        return {
          id: sourceSeed.name.toLowerCase()
                        .replace(' ', '-'),
          name: sourceSeed.name,
          type: 'genre',
        };
      }
    });
  };

  Spotify.addTracksToPlaylist = (userId, playListId, tracksURIs) => {
    const USERID = userId;
    return new Promise((resolve, reject) => {
      // Add tracks to a playlist
      spotifyApi.addTracksToPlaylist(
        USERID,
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
  };


  Spotify.demo = (userId, sourceSeeds, accessToken) => {
    let playlist, seeds, recommendationsLength;
    if (accessToken) {
      setAccessToken(accessToken);
    }
    sourceSeeds = sourceSeeds.filter(
      sourceSeed => sourceSeed.audienceGroup.name === 'Track' ||
                    sourceSeed.audienceGroup.name === 'Songs' ||
                    sourceSeed.audienceGroup.name === 'Artist' ||
                    sourceSeed.audienceGroup.name === 'Celebrities' ||
                    sourceSeed.audienceGroup.name === 'Genre' ||
                    sourceSeed.audienceGroup.name === 'Music Genre');

    return new Promise((resolve, reject) => {
      Spotify.createPlaylist(userId)
             .then((playlistRes) => {
               playlist = playlistRes;
               return Spotify.searchSeedId(sourceSeeds);
             })
             .then((seedsRes) => {
               seeds = seedsRes;
               return Spotify.getRecommendationsBatched(seeds);
             })
             .then((recommendations) => {
               recommendationsLength = recommendations.length;
               return Spotify.addTracksToPlaylist(
                 userId,
                 playlist.id,
                 recommendations,
               );
             })
             .then(() => {
               resolve({
                         results: 'done',
                         tracksAdded: recommendationsLength,
                       });
             })
             .catch((err) => {
               console.log(err);
               reject(err);
             });
    });
  };

  Spotify.remoteMethod('demo', {
    accepts: [
      {
        arg: 'userId',
        type: 'string',
        required: true,
        http: { source: 'query' },
      },
      {
        arg: 'sourceSeeds',
        type: '[seed]',
        required: true,
        http: { source: 'body' },
      },
      { arg: 'accessToken', type: 'string', http: { source: 'query' } },
    ],
    http: { verb: 'post' },
    returns: [
      { arg: 'data', type: 'object', root: true },
    ],
  });
};

let testData = [
  {
    'id': 1,
    'audienceGroupId': 58,
    'name': 'Tom Petty',
    'createdDate': '2016-11-11T15:35:13.655Z',
    'lastUpdatedDate': '2016-11-11T15:35:13.655Z',
    'isDeleted': false,
    'audienceGroup': {
      'id': 58,
      'name': 'Celebrities',
      'createdBy': '1',
      'lastUpdatedBy': '1',
      'createdDate': '2016-11-11T18:40:52.469Z',
      'lastUpdatedDate': '2016-11-11T18:40:52.469Z',
      'isDeleted': false,
      '$type': 'audienceGroup',
    },
    '$type': 'audience',
  },
  {
    'id': 1,
    'audienceGroupId': 58,
    'name': 'Rammstein',
    'createdDate': '2016-11-11T15:35:13.655Z',
    'lastUpdatedDate': '2016-11-11T15:35:13.655Z',
    'isDeleted': false,
    'audienceGroup': {
      'id': 58,
      'name': 'Celebrities',
      'createdBy': '1',
      'lastUpdatedBy': '1',
      'createdDate': '2016-11-11T18:40:52.469Z',
      'lastUpdatedDate': '2016-11-11T18:40:52.469Z',
      'isDeleted': false,
      '$type': 'audienceGroup',
    },
    '$type': 'audience',
  },
  {
    'id': 1,
    'audienceGroupId': 58,
    'name': 'Gangnam Style',
    'createdDate': '2016-11-11T15:35:13.655Z',
    'lastUpdatedDate': '2016-11-11T15:35:13.655Z',
    'isDeleted': false,
    'audienceGroup': {
      'id': 58,
      'name': 'Songs',
      'createdBy': '1',
      'lastUpdatedBy': '1',
      'createdDate': '2016-11-11T18:40:52.469Z',
      'lastUpdatedDate': '2016-11-11T18:40:52.469Z',
      'isDeleted': false,
      '$type': 'audienceGroup',
    },
    '$type': 'audience',
  },
  {
    'id': 1,
    'audienceGroupId': 58,
    'name': 'Pop Rock',
    'createdDate': '2016-11-11T15:35:13.655Z',
    'lastUpdatedDate': '2016-11-11T15:35:13.655Z',
    'isDeleted': false,
    'audienceGroup': {
      'id': 58,
      'name': 'Music Genre',
      'createdBy': '1',
      'lastUpdatedBy': '1',
      'createdDate': '2016-11-11T18:40:52.469Z',
      'lastUpdatedDate': '2016-11-11T18:40:52.469Z',
      'isDeleted': false,
      '$type': 'audienceGroup',
    },
    '$type': 'audience',
  },
  {
    'id': 1,
    'audienceGroupId': 58,
    'name': 'East Asian',
    'createdDate': '2016-11-11T15:35:13.655Z',
    'lastUpdatedDate': '2016-11-11T15:35:13.655Z',
    'isDeleted': false,
    'audienceGroup': {
      'id': 58,
      'name': 'Music Genre',
      'createdBy': '1',
      'lastUpdatedBy': '1',
      'createdDate': '2016-11-11T18:40:52.469Z',
      'lastUpdatedDate': '2016-11-11T18:40:52.469Z',
      'isDeleted': false,
      '$type': 'audienceGroup',
    },
    '$type': 'audience',
  },
  {
    'id': 1,
    'audienceGroupId': 58,
    'name': 'Latin American',
    'createdDate': '2016-11-11T15:35:13.655Z',
    'lastUpdatedDate': '2016-11-11T15:35:13.655Z',
    'isDeleted': false,
    'audienceGroup': {
      'id': 58,
      'name': 'Music Genre',
      'createdBy': '1',
      'lastUpdatedBy': '1',
      'createdDate': '2016-11-11T18:40:52.469Z',
      'lastUpdatedDate': '2016-11-11T18:40:52.469Z',
      'isDeleted': false,
      '$type': 'audienceGroup',
    },
    '$type': 'audience',
  },
  {
    'id': 1,
    'audienceGroupId': 58,
    'name': 'Latin American',
    'createdDate': '2016-11-11T15:35:13.655Z',
    'lastUpdatedDate': '2016-11-11T15:35:13.655Z',
    'isDeleted': false,
    'audienceGroup': {
      'id': 58,
      'name': 'Music Genre beep test',
      'createdBy': '1',
      'lastUpdatedBy': '1',
      'createdDate': '2016-11-11T18:40:52.469Z',
      'lastUpdatedDate': '2016-11-11T18:40:52.469Z',
      'isDeleted': false,
      '$type': 'audienceGroup',
    },
    '$type': 'audience',
  },
];
