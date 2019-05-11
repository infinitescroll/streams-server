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
  const [content] = files[0]
  const fileContent = await textile.file.content(content.file.hash)
  const { type } = JSON.parse(fileContent)
  if (type === 'ADD_GITHUB_WEBHOOK') {
    const { data: { repo, githubUsername, webhookEvents } } = JSON.parse(
      fileContent
    )
    try {
      const config = {
        url: 'http://localhost:3001/api/v0/invite',
        content_type: 'json'
      }
      const data = await axios.post(
        `https://api.github.com/repos/${githubUsername}/${repo}/hooks`,
        {
          events: webhookEvents,
          config,
          name: 'web',
          active: true
        }
      )
      console.log('REGISTERD', data)
    } catch (err) {
      console.log('ERR', err)
    }
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
