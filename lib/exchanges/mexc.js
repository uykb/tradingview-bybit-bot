// lib/exchanges/mexc.js
const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');

const MEXC_API_URL = 'https://api.mexc.com';

// MEXC签名生成
function generateMexcSignature(apiSecret, params) {
  // 将参数按字母排序并转为查询字符串
  const orderedParams = Object.keys(params)
    .sort()
    .reduce((obj, key) => {
      obj[key] = params[key];
      return obj;
    }, {});
  
  const queryString = querystring.stringify(orderedParams);
  
  // 使用HMAC SHA256生成签名
  return crypto
    .createHmac('sha256', apiSecret)
    .update(queryString)
    .digest('hex');
}

async function executeTrade(signal) {
  const apiKey = process.env.MEXC_API_KEY;
  const apiSecret = process.env.MEXC_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    throw new Error('MEXC API凭据未配置');
  }
  
  // 准备订单参数
  const symbol = signal.symbol.replace('/', ''); // MEXC不使用斜杠分隔符
  const timestamp = Date.now();
  
  const orderParams = {
    symbol: symbol,
    side: signal.action.toUpperCase(),
    type: 'MARKET',
    quantity: signal.quantity || process.env.MEXC_DEFAULT_QUANTITY || '0.001',
    timestamp: timestamp,
    recvWindow: 5000
  };
  
  // 添加API密钥和生成签名
  orderParams.apiKey = apiKey;
  orderParams.signature = generateMexcSignature(apiSecret, orderParams);
  
  // 发送到MEXC API
  try {
    const response = await axios({
      method: 'POST',
      url: `${MEXC_API_URL}/api/v3/order`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: querystring.stringify(orderParams)
    });
    
    return response.data;
  } catch (error) {
    console.error('MEXC API错误:', error.response?.data || error.message);
    throw new Error(`MEXC交易执行失败: ${error.response?.data?.msg || error.message}`);
  }
}

module.exports = { executeTrade };
