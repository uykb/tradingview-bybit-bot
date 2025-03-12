## 在Vercel仪表板中添加以下环境变量：

BYBIT_API_KEY - 您的Bybit API密钥
BYBIT_API_SECRET - 您的Bybit API密钥密码
SIGNAL_PASSPHRASE - 用于验证TradingView信号的密码
DEFAULT_QUANTITY - 默认交易数量

## 推送代码到GitHub仓库
在Vercel仪表板导入项目
连接到您的GitHub仓库
配置环境变量
点击Deploy部署

## 在TradingView中设置警报发送到您的Vercel webhook URL：

https://your-project-name.vercel.app/api/webhook
使用以下JSON格式：

{
  "symbol": "{{ticker}}",
  "action": "{{strategy.order.action}}",
  "price": {{close}},
  "quantity": 0.01,
  "passphrase": "YOUR_SECRET_PASSPHRASE"
}
