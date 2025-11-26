// api/create-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // 設置 CORS 頭部
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 處理預檢請求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { amount, currency = 'cad', customer_email, description } = req.body;

      // 驗證金額
      if (!amount || amount < 50) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      // 創建支付意向
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // 確保是整數
        currency,
        description: description || 'Deposit for Greenpro Environmental Services',
        receipt_email: customer_email,
        metadata: {
          company: 'Greenpro Environmental Ltd.',
          service: 'Demolition Services'
        }
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};