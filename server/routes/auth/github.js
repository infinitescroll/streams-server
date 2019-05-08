const router = require('express').Router()
const GitHubStrategy = require('passport-github').Strategy
const passport = require('passport')

const { textile } = require('../../textile')

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
} = require('../../../secrets')

module.exports = router

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, cb) => {
      return cb(null, { ...profile, accessToken, refreshToken })
    }
  )
)

router.get(
  '/callback',
  passport.authenticate('github'),
  async (req, res, next) => {
    const { accessToken, refreshToken } = req.user
    delete req.user.accessToken
    delete req.user.refreshToken

    const { streamId } = req.query

    const threads = await textile.threads.list()
    console.log(threads, streamId, accessToken, refreshToken)

    res.sendStatus(200)
  }
)
