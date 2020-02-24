const router = require('express').Router()
const request = require('request')
const { User } = require('../../db')
module.exports = router

router.put('/', (req, res, next) => {
  const url =
    'https://github.com/login/oauth/access_token?client_id=' +
    process.env.GITHUB_CLIENT_ID +
    '&client_secret=' +
    process.env.GITHUB_CLIENT_SECRET +
    '&code=' +
    req.query.code +
    '&redirect_uri=http://localhost:3000/authorize/app/github'

  request.post(url, {}, (error, response, body) => {
    if (error) return res.status(400).send(error)
    if (!body) return res.status(400).send('No. body.')

    const token = body.substring(body.indexOf('=') + 1, body.indexOf('&'))
    if (token === 'bad_verification_code')
      return res.status(400).send('bad_verification_code')
    if (!token) return res.status(400).send('No dice')

    request(
      {
        url: 'https://api.github.com/user',
        headers: {
          Authorization: 'token ' + token,
          'User-Agent': 'Streams'
        }
      },
      async (error, _, profile) => {
        if (error) return res.status(400).send(error)
        try {
          const user = await User.findByUsernameOrCreate({
            username: profile.login,
            apps: {
              github: {
                accessToken: token,
                profile: {
                  ...body
                }
              }
            }
          })

          return user
        } catch (error) {
          return res.status(400).send(error)
        }
      }
    )
  })
})
