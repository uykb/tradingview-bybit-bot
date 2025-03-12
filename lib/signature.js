// lib/signature.js
const crypto = require('crypto');

function generateBybitSignature(apiKey, apiSecret, timestamp, params) {
  // 排序参数
  const orderedParams = Object.keys(params)
    .sort()
    .reduce((obj, key) => {
      obj[key] = params[key];
      return obj;
    }, {});

  // 构建请求字符串
  const queryString = Object.entries(orderedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // 构建完整签名字符串
  const signatureString = timestamp + apiKey + '5000' + queryString;
  
  // 生成HMAC SHA256签名
  return crypto
    .createHmac('sha256', apiSecret)
    .update(signatureString)
    .digest('hex');
}

module.exports = { generateBybitSignature };
