const { Textile } = require('@textile/js-http-client')
const axios = require('axios')

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

const registerWebhook = async (thread, userAddress, block, ...files) => {
  const [data] = files[0]
  const fileContent = await textile.file.content(data.file.hash)
  const { text } = JSON.parse(fileContent)
  const { type, repo, githubUsername } = JSON.parse(text)
  if (type === 'ADD_WEBHOOK') {
    console.log('MADE IT!')
  }
  return
}

const registerThreadListener = async () => {
  const readableStream = await textile.subscribe.stream(['files'])
  const reader = readableStream.getReader()
  const read = result => {
    if (result.done) return
    try {
      const { thread, payload } = result.value
      const { files, user, block } = payload
      const webhook = registerWebhook(thread, user.address, block, files)
      // console.log(thread, payload, body)
    } catch (err) {
      reader.cancel()
      return
    }
    reader.read().then(read)
  }
  reader.read().then(read)
}

// registerInviteListener()
registerThreadListener()

module.exports = { textile }
