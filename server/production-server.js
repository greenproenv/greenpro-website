const express = require('express');
const stripe = require('stripe')('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');
const cors = require('cors');

const app = express();

// 中間件 - 注意 Webhook 需要原始 body
app.use('/api/webhook', express.raw({type: 'application/json'}));
app.use('/api', express.json());
app.use(cors({
  origin: ['https://greenprogroup.com', 'https://www.greenprogroup.com'],
  credentials: true
}));

// 環境變量
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_3p42YIhmwKHDZPbe1nD62I0Jb2ZoHnSp';

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Production server running',
    environment: 'production',
    timestamp: new Date().toISOString()
  });
});

// 創建支付意向
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'cad', customer_email, description } = req.body;
    
    console.log('💰 PRODUCTION: Creating payment intent for:', { 
      amount, 
      customer_email 
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      description: description,
      receipt_email: customer_email,
      metadata: {
        customer_email: customer_email,
        service: description,
        company: 'Greenpro Environmental Ltd',
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ PRODUCTION: Payment intent created:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      status: paymentIntent.status
    });
  } catch (error) {
    console.error('❌ PRODUCTION: Error creating payment intent:', error);
    res.status(500).json({ 
      error: error.message,
      message: 'Payment processing unavailable'
    });
  }
});

// Webhook 處理
app.post('/api/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;

  try {
    // 驗證 Webhook 簽名
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.log(`❌ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`✅ Webhook received: ${event.type}`);

  // 處理不同類型的事件
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      handlePaymentSuccess(paymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      const paymentFailed = event.data.object;
      handlePaymentFailed(paymentFailed);
      break;
      
    case 'payment_intent.canceled':
      const paymentCanceled = event.data.object;
      handlePaymentCanceled(paymentCanceled);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({received: true});
});

// 支付成功處理函數
async function handlePaymentSuccess(paymentIntent) {
  console.log('🎉 Payment succeeded:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    customer_email: paymentIntent.metadata.customer_email,
    service: paymentIntent.metadata.service
  });
  
  // 這裡可以添加業務邏輯：
  // - 發送確認郵件給客戶
  // - 更新數據庫記錄
  // - 通知管理員
  // - 創建後續工作流程
}

// 支付失敗處理函數
function handlePaymentFailed(paymentIntent) {
  console.log('❌ Payment failed:', {
    id: paymentIntent.id,
    error: paymentIntent.last_payment_error
  });
  
  // 這裡可以：
  // - 發送失敗通知給客戶
  // - 記錄失敗原因
  // - 通知管理員檢查
}

// 支付取消處理函數
function handlePaymentCanceled(paymentIntent) {
  console.log('⚠️ Payment canceled:', paymentIntent.id);
  
  // 這裡可以：
  // - 更新訂單狀態
  // - 釋放預訂資源
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 PRODUCTION server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/api/webhook`);
});