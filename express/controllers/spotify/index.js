var SpotifyService = require('../../services/spotify');

module.exports = {
  addRecommendationsBySeeds: function (req, res, next) {
    var userId = req.body.userId;
    var sourceSeeds = req.body.sourceSeeds;
    var accessToken = req.body.accessToken;
    if (!(
      userId && sourceSeeds && accessToken
    )) {
      var error = new Error('All parameters are required');
      error.statusCode = 400;
      return next(error);
    }

    SpotifyService.addRecommendationsBySeeds(userId, sourceSeeds, accessToken)
                  .then(function (result) {
                    res.json(result);
                  })
                  .catch(function (err) {
                    next(err);
                  });
  },
};
