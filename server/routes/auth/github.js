const router = require('express').Router()
const passport = require('passport')
const GitHubStrategy = require('passport-github').Strategy
const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = require('../../../secrets')
const { User } = require('../../db')
module.exports = router

router.get(
  '/',
  function(req, res, next) {
    if (!req.user || !req.user._id) return res.status(400).send('No user found')
    const callbackURL =
      'http://localhost:3001/api/v0/auth/github/callback?_id=' + req.user._id

    passport.use(
      new GitHubStrategy(
        {
          clientID: GITHUB_CLIENT_ID,
          clientSecret: GITHUB_CLIENT_SECRET,
          callbackURL
        },
        function(accessToken, refreshToken, profile, cb) {
          cb(null, profile, { accessToken, refreshToken })
        }
      )
    )

    next()
  },
  passport.authenticate('github', {
    successRedirect: '/success',
    failureRedirect: '/failure'
  })
)

router.get(
  '/callback',
  function(req, res, next) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: GITHUB_CLIENT_ID,
          clientSecret: GITHUB_CLIENT_SECRET,
          callbackURL: 'http://localhost:3001/api/v0/auth/github/callback'
        },
        function(accessToken, refreshToken, profile, cb) {
          if (!req.query._id) return res.send('No user in request')

          User.findOne({ _id: req.query._id }, (err, user) => {
            if (err) res.status(500).send(err)
            if (!user) res.status(404).send()

            user.apps.github = {
              profile,
              username: profile.username,
              accessToken
            }

            user.save()
            cb(null, profile, { accessToken, refreshToken })
          })
        }
      )
    )

    next()
  },
  passport.authenticate('github', {
    successRedirect: '/success',
    failureRedirect: '/failure'
  })
)
