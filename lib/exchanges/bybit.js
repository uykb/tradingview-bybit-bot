// lib/exchanges/bybit.js
const axios = require('axios');
const crypto = require('crypto');

const BYBIT_API_URL = 'https://api.bybit.com';

// Bybit签名生成
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

async function executeTrade(signal) {
  const apiKey = process.env.BYBIT_API_KEY;
  const apiSecret = process.env.BYBIT_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    throw new Error('Bybit API凭据未配置');
  }
  
  // 准备订单参数
  const orderParams = {
    category: 'spot',  // 或 'linear' 用于合约
    symbol: signal.symbol,
    side: signal.action.toUpperCase(),
    orderType: 'Market',
    qty: signal.quantity || process.env.BYBIT_DEFAULT_QUANTITY || '0.001',
    timeInForce: 'GoodTillCancel'
  };
  
  // 生成时间戳和签名
  const timestamp = Date.now().toString();
  const signature = generateBybitSignature(apiKey, apiSecret, timestamp, orderParams);
  
  // 发送到Bybit API
  try {
    const response = await axios({
      method: 'POST',
      url: `${BYBIT_API_URL}/v5/order/create`,
      headers: {
        'Content-Type': 'application/json',
        'X-BAPI-API-KEY': apiKey,
        'X-BAPI-TIMESTAMP': timestamp,
        'X-BAPI-RECV-WINDOW': '5000',
        'X-BAPI-SIGN': signature
      },
      data: orderParams
    });
    
    return response.data;
  } catch (error) {
    console.error('Bybit API错误:', error.response?.data || error.message);
    throw new Error(`Bybit交易执行失败: ${error.response?.data?.retMsg || error.message}`);
  }
}

module.exports = { executeTrade };
