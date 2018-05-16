var config = {
  spotify: {
    userApp: {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    },
    defaultPlayListName: 'C8 playlist [dev]',
  },
};

module.exports = function () {
  return config;
};
