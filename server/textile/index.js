const { Textile } = require('@textile/js-http-client')
const axios = require('axios')
const streamEventSchema = require('./streamEventSchema')

const types = {
  github: 'STORE_GITHUB_ACCESS_TOKEN'
}

const textile = new Textile({
  url: 'http://127.0.0.1',
  port: 40600,
  config: {
    API: {
      HTTPHeaders: '*'
    }
  }
})

const createWebhookThread = async peerId => {
  const { hash } = await textile.schemas.add(streamEventSchema)
  return textile.threads.add(
    `${peerId}-webhooks`,
    hash,
    null,
    'private',
    'invite_only'
  )
}

const parseFile = async data => {
  const fileContent = await textile.file.content(data.file.hash)
  return JSON.parse(fileContent)
}

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

const fetchAccessToken = async (application, webhookThreadId) => {
  const { items } = await textile.files.list(webhookThreadId, 0, 100)
  const blocks = await Promise.all(
    items.map(async block => parseFile(block.files[0]))
  )
  const blocksWithToken = blocks.filter(
    ({ type }) => types[application] === type
  )
  return blocksWithToken.length > 0
    ? blocksWithToken[blocksWithToken.length - 1].data.accessToken
    : null
}

const registerGithubWH = async (
  webhookThreadId,
  { data: { repo, githubUsername, webhookEvents } }
) => {
  const accessToken = await fetchAccessToken('github', webhookThreadId)
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
      },
      {
        headers: {
          Authorization: `token ${accessToken}`
        }
      }
    )
    return data
  } catch (err) {
    throw new Error(err)
  }
}

const registerWebhook = async (thread, userAddress, block, file) => {
  const fileContent = await parseFile(file)

  let webhook
  try {
    if (fileContent.type === 'ADD_GITHUB_WEBHOOK')
      webhook = await registerGithubWH(thread, fileContent)
  } catch (error) {
    throw new Error(error)
  }
  return webhook
}

const registerThreadListener = async () => {
  const readableStream = await textile.subscribe.stream(['files'])
  const reader = readableStream.getReader()
  const read = async result => {
    if (result.done) return
    try {
      const { thread, payload } = result.value
      const { files, user, block } = payload
      // TODO: handle multiple files (don't hardcode [0])
      const webhook = await registerWebhook(
        thread,
        user.address,
        block,
        files[0]
      )
    } catch (err) {
      reader.cancel()
      return
    }
    reader.read().then(read)
  }
  reader.read().then(read)
}

const getWebhookThreadId = async peerId => {
  const threads = await textile.threads.getByName(`${peerId}-webhooks`)
  if (threads.length === 0) {
    throw new Error(`No webhook thread configured for peerId: ${peerId}`)
  }
  const { id } = threads[0]
  return id
}

const storeAccessToken = async (accessToken, application, peerId) => {
  const id = await getWebhookThreadId(peerId)
  await textile.files.add(
    JSON.stringify({
      type: 'STORE_GITHUB_ACCESS_TOKEN',
      data: {
        accessToken,
        application
      }
    }),
    `Your access token for: ${application}`,
    id
  )
}

// registerInviteListener()
registerThreadListener()

module.exports = { textile, storeAccessToken, createWebhookThread }
