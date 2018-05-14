var config = {
  spotify: {
    userApp: {
      clientId: '3972abbe8fb6496ca4f60724ac85be47',
      clientSecret: 'd18350faa4d54ef694dde4326e5461e4',
      redirectUri: 'http://localhost:4300',
    },
    defaultPlayListName: 'C8 Sergey playlist [dev]',
  },
};

module.exports = function () {
  return config;
};
