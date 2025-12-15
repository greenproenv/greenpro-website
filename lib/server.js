// 将您的 Express 应用转换为 Workers 兼容格式
export function handleRequest(request) {
  const url = new URL(request.url)
  
  // 路由处理
  if (url.pathname === '/api/create-payment-intent' && request.method === 'POST') {
    return handleCreatePaymentIntent(request)
  }
  
  if (url.pathname === '/api/webhook' && request.method === 'POST') {
    return handleWebhook(request)
  }
  
  return new Response('Not Found', { status: 404 })
}

async function handleCreatePaymentIntent(request) {
  try {
    const body = await request.json()
    // 您的 Stripe 支付逻辑
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: body.amount,
      currency: 'usd',
      // ... 其他参数
    })
    
    return new Response(JSON.stringify({
      clientSecret: paymentIntent.client_secret
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function handleWebhook(request) {
  // 您的 webhook 处理逻辑
}