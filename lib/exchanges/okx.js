// lib/exchanges/okx.js
const axios = require('axios');
const crypto = require('crypto');

const OKX_API_URL = 'https://www.okx.com';

// OKX签名生成
function generateOkxSignature(apiKey, apiSecret, timestamp, method, requestPath, body) {
  // OKX的签名字符串格式: timestamp + method + requestPath + body
  const signString = timestamp + method + requestPath + (body ? JSON.stringify(body) : '');
  
  // 使用HMAC SHA256生成签名
  return crypto
    .createHmac('sha256', apiSecret)
    .update(signString)
    .digest('base64');
}

async function executeTrade(signal) {
  const apiKey = process.env.OKX_API_KEY;
  const apiSecret = process.env.OKX_API_SECRET;
  const apiPassphrase = process.env.OKX_API_PASSPHRASE;
  
  if (!apiKey || !apiSecret || !apiPassphrase) {
    throw new Error('OKX API凭据未完全配置');
  }
  
  // 准备订单参数
  const orderParams = {
    instId: signal.symbol,
    tdMode: 'cash',  // 现货是cash，合约是cross或isolated
    side: signal.action.toLowerCase() === 'buy' ? 'buy' : 'sell',
    ordType: 'market',
    sz: signal.quantity || process.env.OKX_DEFAULT_QUANTITY || '0.001'
  };
  
  // 生成时间戳和签名
  const timestamp = new Date().toISOString();
  const method = 'POST';
  const requestPath = '/api/v5/trade/order';
  const signature = generateOkxSignature(apiKey, apiSecret, timestamp, method, requestPath, orderParams);
  
  // 发送到OKX API
  try {
    const response = await axios({
      method,
      url: `${OKX_API_URL}${requestPath}`,
      headers: {
        'Content-Type': 'application/json',
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': apiPassphrase
      },
      data: orderParams
    });
    
    if (response.data.code !== '0') {
      throw new Error(`OKX API错误: ${response.data.msg || '未知错误'}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('OKX API错误:', error.response?.data || error.message);
    throw new Error(`OKX交易执行失败: ${error.response?.data?.msg || error.message}`);
  }
}

module.exports = { executeTrade };
