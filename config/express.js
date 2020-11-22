var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy
    //Other strategies go here
;

var verifyHandler = function(token, tokenSecret, profile, done) {
  process.nextTick(function() {
    console.log(profile);
    User.findOne({uid: profile.id}, function(err, user) {
      if (user) {
        return done(null, user);
      } else {

        var data = {
          provider: profile.provider,
          uid: profile.id,
          name: profile.displayName
        };

        if (profile.emails && profile.emails[0] && profile.emails[0].value) {
          data.email = profile.emails[0].value;
        }
        if (profile.name && profile.name.givenName) {
          data.firstname = profile.name.givenName;
        }
        if (profile.name && profile.name.familyName) {
          data.lastname = profile.name.familyName;
        }

        User.create(data, function(err, user) {
          return done(err, user);
        });
      }
    });
  });
};

passport.serializeUser(function(user, done) {
  done(null, user.uid);
});

passport.deserializeUser(function(uid, done) {
  User.findOne({uid: uid}, function(err, user) {
    done(err, user);
  });
});

module.exports.http = {

  customMiddleware: function(app) {

    passport.use(new FacebookStrategy({
      clientID: "642824379221129", // Use your Facebook App Id
      clientSecret: "c78da1528d95df09e3cc2c18bc32e145", // Use your Facebook App Secret
      callbackURL: "http://yiunic.com/auth/facebook/",
      profileFields: ['id', 'emails', 'name', 'displayName']
    }, verifyHandler));

    app.use(passport.initialize());
    app.use(passport.session());
  }

};
