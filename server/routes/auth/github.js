const router = require('express').Router()
const passport = require('passport')
const GitHubStrategy = require('passport-github').Strategy
const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = require('../../../secrets')
const { User } = require('../../db')
module.exports = router

router.get(
  '/',
  function(req, res, next) {
    if (!req.user || !req.user.id) {
      return res.status(400).send('No user found')
    }
    const callbackURL =
      'http://localhost:3001/api/v0/auth/github/callback?id=' + req.user.id

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
    successRedirect: '/',
    failureRedirect: '/error'
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
          if (!req.query.id) return res.send('No user found')

          User.findOne({ _id: req.query.id }, (err, user) => {
            if (err) res.status(500).send(err)

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
    successRedirect: '/',
    failureRedirect: '/error'
  })
)
