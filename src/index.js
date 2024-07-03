const { createServer } = require('http')
const { URL } = require('url')
const { pipeline } = require('stream')
const { RedditSimple } = require('reddit-simple')
const { Client } = require('undici')
const logger = require('pino')()
const httpLogger = require('pino-http')({ logger })
const dayjs = require('dayjs')

const PORT = Number.parseInt(process.env.PORT, 10) || 8000
const ADDRESS = process.env.ADDRESS || '0.0.0.0'
const SUBREDDIT = process.env.SUBREDDIT || 'EarthPorn'

let cache = undefined
let timestamp = undefined

async function getRandomPlantPic() {
  const now = dayjs()
  if (timestamp && cache && now.isSame(timestamp, 'day')) {
    console.log(`Reusing cache from ${timestamp.toISOString()}!`)
    return cache
  }

  while (true) {
    const resp = await RedditSimple.RandomPost(SUBREDDIT)
    const url = (
      resp[0] &&
      resp[0].data &&
      resp[0].data.preview &&
      resp[0].data.preview.images[0] &&
      resp[0].data.preview.images[0].source &&
      resp[0].data.preview.images[0].source.url
    )

    if (url) {
      cleanUrl = url.replace('&amp;', '&')
      if ((timestamp == null) || (cache == null)) {
        cache = cleanUrl
        timestamp = now.clone()
      }
      return cleanUrl
    }
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(await getRandomPlantPic())
  // httpLogger(req, res)
  // req.log.info(`serving from ${url}`)
  const baseUrl = `${url.origin}/`
  const path = `${url.pathname}${url.search}`
  const client = new Client(baseUrl)
  const { headers, body, statusCode } = await client.request({
    path,
    method: 'GET'
  })

  res.writeHead(statusCode, headers)
  pipeline(
    body,
    res,
    (err) => {
      if (err) {
        console.error('Error while fetching and serving image', err)
      }
    }
  )
})

server.listen(PORT, ADDRESS, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  const addr = server.address()
  logger.info(`Listening on http://${addr.address}:${addr.port}`)
})
