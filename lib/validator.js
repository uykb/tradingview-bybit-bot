// lib/validator.js
function validateSignal(signal) {
  // 检查必要字段
  const requiredFields = ['symbol', 'action', 'price', 'passphrase'];
  
  for (const field of requiredFields) {
    if (!signal[field]) {
      return {
        valid: false,
        error: `缺少必要字段: ${field}`
      };
    }
  }
  
  // 验证密码短语
  const correctPassphrase = process.env.SIGNAL_PASSPHRASE;
  if (signal.passphrase !== correctPassphrase) {
    return {
      valid: false,
      error: '无效的密码短语'
    };
  }
  
  // 验证交易行为
  if (!['buy', 'sell'].includes(signal.action.toLowerCase())) {
    return {
      valid: false,
      error: '无效的交易行为，必须是 buy 或 sell'
    };
  }
  
  return { valid: true };
}

module.exports = { validateSignal };
