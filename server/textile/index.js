const { Textile } = require('@textile/js-http-client')

const textile = new Textile({
  url: 'http://127.0.0.1',
  port: 40600,
  config: {
    API: {
      HTTPHeaders: '*'
    }
  }
})

const registerInviteListener = () => {
  setTimeout(async () => {
    const { items } = await textile.invites.list()
    try {
      await Promise.all(
        items.map(async invite => textile.invites.accept(invite.id))
      )
    } catch (error) {
      throw new Error('error accepting invite', error)
    }
    registerInviteListener()
  }, 5000)
}

const registerThreadListener = async () => {
  const readableStream = await textile.subscribe.stream()
  const reader = readableStream.getReader()
  const read = result => {
    if (result.done) return
    try {
      // result is ReadableStreamReadResult<FeedItem>
      console.log(result.value) // FeedItem
    } catch (err) {
      reader.cancel()
      return
    }
    reader.read().then(read)
  }
  reader.read().then(read)
}

registerInviteListener()
registerThreadListener()

module.exports = { textile }
