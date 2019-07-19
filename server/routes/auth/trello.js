const passport = require('passport')
const TrelloStrategy = require('passport-trello').Strategy

passport.use(
  new TrelloStrategy(
    {
      consumerKey: '09de14caa4492e8d4d8628e1de285ab2',
      consumerSecret:
        '12a5e755a5057b878cc7acd5e90e6af04abee94e68b5f1b2dcff5befde0f0fe7',
      callbackURL: 'http://579d2a3f.ngrok.io/api/v0/auth/trello/callback',
      passReqToCallback: true,
      trelloParams: {
        scope: 'read,write',
        name: 'GitHub',
        expiration: 'never'
      }
    },
    (req, token, tokenSecret, profile, done) => {
      return cb(null, { ...profile, accessToken, refreshToken })
    }
  )
)

router.post('/callback', passport.authenticate('trello'), async (req, res) => {
  const { accessToken } = req.user
  delete req.user.accessToken
  delete req.user.refreshToken

  const { peerId } = req.query
  try {
    res.sendStatus(201)
  } catch (error) {
    next(error)
  }
})
