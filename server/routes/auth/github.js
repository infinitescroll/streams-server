const router = require('express').Router()
const GitHubStrategy = require('passport-github').Strategy
const passport = require('passport')

const { storeAccessToken } = require('../../textile')

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL
} = require('../../../secrets')

module.exports = router

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL
    },
    (accessToken, refreshToken, profile, cb) => {
      return cb(null, { ...profile, accessToken, refreshToken })
    }
  )
)

router.post('/callback', passport.authenticate('github'), async (req, res) => {
  const { accessToken } = req.user
  delete req.user.accessToken
  delete req.user.refreshToken

  const { peerId } = req.query
  try {
    await storeAccessToken(accessToken, 'github', peerId)
    res.sendStatus(201)
  } catch (error) {
    next(error)
  }
})
