const axios = require('axios');

const fetchRandomTopPost = async (subreddit, by) => {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 GLS/100.10.9939.100"
  }
  const res = await axios.get(`https://www.reddit.com/r/${subreddit}/top.json?t=${by}`, { headers });
  if (res.length <= 0)
    return null

  const posts = res.data.data.children
  const idx = Math.floor(Math.random() * posts.length)

  return posts[idx]
}


module.exports = {
  fetchRandomTopPost,
}
