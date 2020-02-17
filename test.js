const test = require('ava')
const http = require('http')
const listen = require('test-listen')
const { Stream } = require('./server/db')
const got = require('got')
const app = require('./server')
const mongoose = require('mongoose')

const testStream = {
  name: 'Test stream',
  feeds: [
    {
      parent: 'openworklabs/streams-server',
      app: 'GitHub',
      filters: {
        timeFrame: 'day',
        types: ['IssueCommentEvent', 'PushEvent'],
        usernames: ['listenaddress'],
        subParents: ['refs/heads/primary'],
        subFeeds: ['primary']
      }
    }
  ]
}

test.before(async t => {
  const startDB = () => {
    return new Promise((resolve, reject) => {
      mongoose.connect('mongodb://localhost/streamsDB', {
        useNewUrlParser: true
      })
      const db = mongoose.connection

      db.on('error', () => {
        console.error.bind(console, 'connection error:')
        reject()
      })

      db.once('open', async () => {
        t.context.server = http.createServer(app)
        t.context.baseUrl = await listen(t.context.server)
        resolve()
      })
    })
  }

  await startDB()
})

test.after.always(t => {
  t.context.server.close()
})

test.serial('Create a stream', async t => {
  const stream = await Stream.create(testStream)

  t.is(stream.name, 'Test stream')
  t.is(stream.feeds[0].app, 'GitHub')
  t.is(stream.feeds[0].filters.types[0], 'IssueCommentEvent')
})

test.serial('POST /stream', async t => {
  const { body } = await got.post(t.context.baseUrl + '/api/v0/streams', {
    json: testStream,
    responseType: 'json'
  })

  t.is(body.name, 'Test stream')
})

test.serial('GET /stream/:id', async t => {
  const { body } = await got.post(t.context.baseUrl + '/api/v0/streams', {
    json: { ...testStream, name: 'Test stream 2' },
    responseType: 'json'
  })

  const fetched = await got(t.context.baseUrl + `/api/v0/streams/${body._id}`, {
    responseType: 'json'
  })

  t.is(fetched.body.name, 'Test stream 2')
})

test.serial('PUT /stream/:id', async t => {
  const { body } = await got.post(t.context.baseUrl + '/api/v0/streams', {
    json: { ...testStream, name: 'Test stream 2' },
    responseType: 'json'
  })

  const res = await got.put(t.context.baseUrl + `/api/v0/streams/${body._id}`)

  t.is(res.statusCode, 204)
})

test.serial('DELETE /stream/:id', async t => {
  const { body } = await got.post(t.context.baseUrl + '/api/v0/streams', {
    json: { ...testStream, name: 'Test stream 2' },
    responseType: 'json'
  })

  const res = await got.delete(
    t.context.baseUrl + `/api/v0/streams/${body._id}`
  )

  t.is(res.statusCode, 202)
})
