const test = require('ava')
const { Stream } = require('./server/db')

test('Create a stream', async t => {
  const stream = new Stream({
    name: 'Test stream',
    feeds: [
      {
        parent: '123',
        app: 'GitHub',
        filters: {
          timeFrame: 'day',
          types: ['commits'],
          by: ['listenaddress'],
          subFeeds: ['primary']
        }
      }
    ]
  })

  t.is(stream.name, 'Test stream')
  t.is(stream.feeds[0].app, 'GitHub')
  t.is(stream.feeds[0].filters.types[0], 'commits')
})
