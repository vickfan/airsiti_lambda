module.exports.lambdaHandler = async (event, context) => {
  const crypto = require('crypto')

  const secret = process.env.CRON_SECRET
  const iv = process.env.CRON_IV
  const jobKey = process.env.JOB_KEY
  const fetchUrl = process.env.URL
  const httpMethod = process.env.HTTP_METHOD

  // An encrypt function
  function encrypt(text) {
    // Creating Cipheriv with its parameter
    let cipher = crypto.createCipheriv('aes-256-cbc', secret, iv)
    let encrypted = cipher.update(JSON.stringify(text), 'utf8', 'base64')
    let signatureKey = encrypted + cipher.final('base64')
    return signatureKey
  }

  const timestampObj = { timestamp: Math.floor(Date.now() / 1000)}
  const signature = encrypt(JSON.stringify(timestampObj))
  const isGet = httpMethod === 'GET'
  const body = { signature, jobKey }

  const res = await fetch(fetchUrl, {
    method: httpMethod,
    body: isGet? null : JSON.stringify(body),
    headers: { "Content-Type": "application/json"},
  })
  return res.status
}