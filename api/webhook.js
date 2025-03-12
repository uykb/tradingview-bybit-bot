// api/webhook.js
const { validateSignal } = require('../lib/validator');
const exchanges = require('../lib/exchanges');

module.exports = async (req, res) => {
  // 只接受POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持POST方法' });
  }

  try {
    const signal = req.body;
    
    // 验证信号
    const validationResult = validateSignal(signal);
    if (!validationResult.valid) {
      return res.status(400).json({ error: validationResult.error });
    }
    
    // 确定使用哪个交易所
    const exchange = signal.exchange?.toLowerCase() || process.env.DEFAULT_EXCHANGE?.toLowerCase() || 'bybit';
    
    // 检查是否支持该交易所
    if (!exchanges[exchange]) {
      return res.status(400).json({ 
        success: false, 
        error: `不支持的交易所: ${exchange}. 支持的交易所: ${Object.keys(exchanges).join(', ')}` 
      });
    }
    
    // 执行交易
    const tradeResult = await exchanges[exchange].executeTrade(signal);
    
    // 返回结果
    return res.status(200).json({
      success: true,
      message: `${exchange.toUpperCase()} 交易执行成功`,
      data: tradeResult
    });
  } catch (error) {
    console.error('处理交易信号时出错:', error);
    return res.status(500).json({
      success: false,
      message: '处理信号时发生错误',
      error: error.message
    });
  }
};
