const router = require('express').Router()
const request = require('request')
const { User } = require('../../db')
const bent = require('bent')
module.exports = router

router.put('/', async (req, res, next) => {
  const url =
    'https://github.com/login/oauth/access_token?client_id=' +
    process.env.GITHUB_CLIENT_ID +
    '&client_secret=' +
    process.env.GITHUB_CLIENT_SECRET +
    '&code=' +
    req.query.code +
    '&redirect_uri=http://localhost:3000/authorize/app/github'

  try {
    const post = bent('POST', 'json', { 'Content-Type': 'application/json' })
    const { access_token } = await post(url)

    const get = bent('GET', 'json', {
      'Content-Type': 'application/json',
      Authorization: 'token ' + access_token,
      'User-Agent': 'Streams'
    })

    const profile = await get('https://api.github.com/user')

    const { user, created } = await User.findByUsernameOrCreate({
      username: profile.login,
      apps: {
        github: {
          accessToken: access_token,
          profile
        }
      }
    })

    const statusCode = created ? 201 : 200
    return res.status(statusCode).send(user)
  } catch (error) {
    return res.status(400).send(error)
  }
})
