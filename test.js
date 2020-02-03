const test = require('ava')
const { Stream } = require('./server/db')

test('Create a stream', async t => {
  const stream = new Stream({ name: 'Test stream' })
  t.is(stream.name, 'Test stream')
})
