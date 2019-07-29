const router = require('express').Router()
const passport = require('passport')
const GitHubStrategy = require('passport-github').Strategy
const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = require('../../../secrets')
const { User } = require('../../db')
module.exports = router

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET
    },
    function(accessToken, refreshToken, profile, cb) {
      cb(null, profile, { accessToken, refreshToken })
    }
  )
)

router.get('/', function(req, res, next) {
  if (!req.user || !req.user._id) return res.status(400).send('No user found')

  passport.authenticate('github', {
    callbackURL:
      'http://localhost:3001/api/v0/auth/github/callback?_id=' + req.user._id
  })(req, res, next)
})

router.get('/callback', function(req, res, next) {
  passport.authenticate('github', null, function(err, profile, tokens) {
    if (!req.query._id) return res.send('No user in request')

    User.findOne({ _id: req.query._id }, (err, user) => {
      if (err) res.status(500).send(err)
      if (!user) res.status(404).send()

      user.apps.github = {
        profile,
        username: profile.username,
        accessToken: tokens.accessToken
      }

      user.save()
      res.redirect('/')
    })
  })(req, res, next)
})
