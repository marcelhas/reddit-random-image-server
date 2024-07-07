const axios = require('axios');

const fetchRandomTopPost = async (subreddit, by) => {
  const res = await axios.get(`https://www.reddit.com/r/${subreddit}/top.json?t=${by}`);
  if (res.length <= 0)
    return null

  console.log("here")
  const posts = res.data.data.children
  const idx = Math.floor(Math.random() * posts.length)
  // const sortedPosts = posts.sort((a,b) => a.data.ups - b.data.ups)

  return posts[idx]
}


module.exports = {
  fetchRandomTopPost,
}
