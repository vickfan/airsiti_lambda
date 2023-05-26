module.exports.lambdaHandler = async (event, context) => {
  const moment = require('moment-timezone')
  const crypto = require('crypto')
  const axios = require('axios')
  const fetchUrl = process.env.FETCH_URL
  const apiKey = process.env.API_KEY
  const signature = process.env.signature

  // get the car plate and car park id
  console.log(event)
  let carPlate, carParkId

  // create payload
  const payload = {
    cpkID: carParkId,
    Ipn: carPlate.replace(' ', ''),
    Nonce: '',
    Timestamp: moment().unix(),
    APIID: apiKey
  }
  // sign the payload
  const signedSignature = sign(payload)

  // add key to the payload
  payload.sign = signedSignature
  
  // send request to endpoint
  try {
    const res = await axios.post(fetchUrl, payload)
    if (res.Success) {
      return {
        statusCode: 200
      }
    } else {
      return {
        statusCode: 500,
        message: res.Message
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: error
    }
  }

  function sign(payload) {
    // sort the payload
    const sorted = Object.keys(payload).sort().reduce(
      (obj, key) => {
        obj[key] = payload[key]
        return obj
      }, {}
    )
    // construct in the format of 'key1=value1&key2=value2'
    let queryString = new URLSearchParams(sorted).toString()
    // add signature to the end of query string
    queryString += `&key=${signature}`
    // hash the query string by SHA256
    const hash = crypto.createHash('sha256').update(queryString).digest('hex')
    return hash
  }

}
