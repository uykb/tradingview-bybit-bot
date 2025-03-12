// api/webhook.js
const { validateSignal } = require('../lib/validator');
const { executeTrade } = require('../lib/bybit');

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
    
    // 执行交易
    const tradeResult = await executeTrade(signal);
    
    // 返回结果
    return res.status(200).json({
      success: true,
      message: '交易执行成功',
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
