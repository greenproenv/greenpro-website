// server.js
const express = require('express');
const stripe = require('stripe')('sk_live_您的正式私鑰');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(cors());
app.use(express.json());

// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Greenpro API is running' });
});

// 創建支付意圖端點
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, customer_email, description } = req.body;
    
    console.log('Creating payment intent for:', {
      amount,
      currency,
      customer_email,
      description
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency || 'cad',
      description,
      receipt_email: customer_email,
      metadata: {
        customer_email: customer_email,
        service: description
      }
    });

    console.log('Payment intent created:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code
    });
  }
});

// 錯誤處理中間件
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 啟動服務器
app.listen(PORT, () => {
  console.log(`Greenpro backend server running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});