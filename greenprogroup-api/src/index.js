// 处理所有 API 请求的 Cloudflare Worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS 配置 - 允许来自您前端的请求
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://greenprogroup.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, stripe-signature',
    };

    // 处理预检请求
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 路由处理
      switch (path) {
        case '/create-payment-intent':
          return await handleCreatePaymentIntent(request, env, corsHeaders);
        
        case '/webhook':
          return await handleWebhook(request, env, corsHeaders);
        
        case '/health':
          return new Response(JSON.stringify({ status: 'healthy' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        
        default:
          return new Response('Not Found', {
            status: 404,
            headers: corsHeaders
          });
      }
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// 创建支付意向
async function handleCreatePaymentIntent(request, env, corsHeaders) {
  // 确保是 POST 请求
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  const body = await request.json();
  
  // 使用 Stripe REST API（无需安装 stripe 包）
  const response = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      amount: String(body.amount),
      currency: body.currency || 'usd',
      'automatic_payment_methods[enabled]': 'true',
      metadata: JSON.stringify(body.metadata || {})
    })
  });

  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json' 
    }
  });
}

// 处理 webhook
async function handleWebhook(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  const payload = await request.text();
  const sig = request.headers.get('stripe-signature');

  // 在实际应用中，这里需要验证签名
  // 简化版：直接解析 JSON
  const event = JSON.parse(payload);
  
  // 记录 webhook 事件
  console.log(`Received webhook event: ${event.type}`);
  
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}