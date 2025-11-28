const express = require('express');
const stripe = require('stripe')('sk_test_...'); // 替换为你的测试密钥
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 测试支付意向端点
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'cad', customer_email, description } = req.body;
    
    console.log('💰 Creating payment intent for:', { 
      amount, 
      currency, 
      customer_email, 
      description 
    });

    // 验证金额
    if (!amount || amount < 50) {
      return res.status(400).json({ 
        error: 'Invalid amount',
        message: 'Amount must be at least $0.50' 
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      description: description,
      receipt_email: customer_email,
      metadata: {
        customer_email: customer_email,
        service: description,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Payment intent created:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      status: paymentIntent.status
    });
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({ 
      error: error.message,
      type: error.type,
      message: 'Failed to create payment intent'
    });
  }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    service: 'Stripe Test Server'
  });
});

// 获取支付意向状态
app.get('/api/payment-intent/:id', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);
    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});