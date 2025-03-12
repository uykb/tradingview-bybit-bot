// lib/exchanges/okx.js
const axios = require('axios');
const crypto = require('crypto');

// 添加模拟盘API URL
const OKX_LIVE_API_URL = 'https://www.okx.com';
const OKX_DEMO_API_URL = 'https://www.okx.com'; // 基础URL相同

// OKX签名生成
function generateOkxSignature(apiKey, apiSecret, timestamp, method, requestPath, body) {
  const signString = timestamp + method + requestPath + (body ? JSON.stringify(body) : '');
  return crypto
    .createHmac('sha256', apiSecret)
    .update(signString)
    .digest('base64');
}

async function executeTrade(signal) {
  // 判断是否使用模拟盘
  const useDemo = process.env.OKX_USE_DEMO === 'true';
  
  // 根据环境选择正确的API密钥
  const apiKey = useDemo ? process.env.OKX_DEMO_API_KEY : process.env.OKX_API_KEY;
  const apiSecret = useDemo ? process.env.OKX_DEMO_API_SECRET : process.env.OKX_API_SECRET;
  const apiPassphrase = useDemo ? process.env.OKX_DEMO_API_PASSPHRASE : process.env.OKX_API_PASSPHRASE;
  
  if (!apiKey || !apiSecret || !apiPassphrase) {
    throw new Error(`OKX ${useDemo ? '模拟盘' : '实盘'} API凭据未完全配置`);
  }
  
  // 准备订单参数
  const orderParams = {
    instId: signal.symbol,
    tdMode: 'cash',
    side: signal.action.toLowerCase() === 'buy' ? 'buy' : 'sell',
    ordType: 'market',
    sz: signal.quantity || process.env.OKX_DEFAULT_QUANTITY || '0.001'
  };
  
  // 生成时间戳和签名
  const timestamp = new Date().toISOString();
  const method = 'POST';
  
  // 关键修改：根据是否为模拟盘选择不同的请求路径
  const requestPath = useDemo 
    ? '/api/v5/trade/order-mock' // 模拟盘路径
    : '/api/v5/trade/order';      // 实盘路径
  
  const signature = generateOkxSignature(apiKey, apiSecret, timestamp, method, requestPath, orderParams);
  
  // 发送到OKX API
  try {
    const baseUrl = useDemo ? OKX_DEMO_API_URL : OKX_LIVE_API_URL;
    const response = await axios({
      method,
      url: `${baseUrl}${requestPath}`,
      headers: {
        'Content-Type': 'application/json',
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': apiPassphrase,
        // 重要：模拟盘需要添加此头部
        ...(useDemo ? {'x-simulated-trading': '1'} : {})
      },
      data: orderParams
    });
    
    if (response.data.code !== '0') {
      throw new Error(`OKX ${useDemo ? '模拟盘' : '实盘'} API错误: ${response.data.msg || '未知错误'}`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`OKX ${useDemo ? '模拟盘' : '实盘'} API错误:`, error.response?.data || error.message);
    throw new Error(`OKX ${useDemo ? '模拟盘' : '实盘'} 交易执行失败: ${error.response?.data?.msg || error.message}`);
  }
}

module.exports = { executeTrade };
