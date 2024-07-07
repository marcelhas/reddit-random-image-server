const { createServer } = require('http')
const { URL } = require('url')
const { pipeline } = require('stream')
const { RedditSimple } = require('reddit-simple')
const { Client } = require('undici')
const logger = require('pino')()
const httpLogger = require('pino-http')({ logger })
const { fetchRandomTopPost } = require("./reddit.js")
const dayjs = require('dayjs')

const PORT = Number.parseInt(process.env.PORT, 10) || 8000
const ADDRESS = process.env.ADDRESS || '0.0.0.0'
const SUBREDDITS = (process.env.SUBREDDITS || 'EarthPorn,pics,ProgrammerHumor').split(",")

let cache = undefined
let timestamp = undefined

async function getRandomPlantPic() {
  const now = dayjs()
  if (timestamp && cache && now.isSame(timestamp, 'day')) {
    console.log(`Reusing cache from ${timestamp.toISOString()}!`)
    return cache
  }
  const subreddit = SUBREDDITS[Math.floor(Math.random() * SUBREDDITS.length)]

  while (true) {
    const post = await fetchRandomTopPost(subreddit, "month")
    const url = (
      post &&
      post.data &&
      !post.data.is_video &&
      post.data.preview &&
      post.data.preview.images[0] &&
      post.data.preview.images[0].source &&
      post.data.preview.images[0].source.url
    )

    if (url) {
      console.log(subreddit)
      console.log(url)
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
