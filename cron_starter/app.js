module.exports.lambdaHandler = async (event, context) => {
  const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

  const crypto = require('crypto')

  const secret = process.env.CRON_SECRET
  const iv = process.env.CRON_IV
  const jobKey = process.env.JOB_KEY

  // An encrypt function
  function encrypt(text) {
    // Creating Cipheriv with its parameter
    let cipher = crypto.createCipheriv('aes-256-cbc', secret, iv)
    return cipher.update(JSON.stringify(text), 'utf8', 'base64')
  }

  const timestampObj = { timestamp: Math.floor(Date.now() / 1000)}
  const signature = encrypt(JSON.stringify(timestampObj))

  const res = await fetch(process.env.URL, {
    method: 'post',
    headers: { "content-type": "application/json", },
    body: { signature, jobKey }
  })

  return res.status
}