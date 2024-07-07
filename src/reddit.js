const axios = require('axios');

const fetchRandomTopPost = async (subreddit, by) => {
  const res = await axios.get(`https://www.reddit.com/r/${subreddit}/top.json?t=${by}`);
  if (res.length <= 0)
    return null

  const posts = res.data.data.children
  const idx = Math.floor(Math.random() * posts.length)

  return posts[idx]
}


module.exports = {
  fetchRandomTopPost,
}
