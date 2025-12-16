// src/GreenPro.jsx
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import "react-datepicker/dist/react-datepicker.css";

// 在 GreenPro.jsx 頂部添加環境檢查
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (isProduction 
    ? 'https://api.greenprogroup.com'  // 生产环境 API
    : 'http://localhost:3000/api');    // 开发环境 API

// 初始化 Stripe - 使用正式生產環境密鑰
const stripePromise = loadStripe('pk_live_51SXr2QFgjw1i4JGvYBnn9GuPyWYeoGXyl9wEjkWx6Afox6dLGHiJjSlPSk5PLgck9ifLmLj3L8y0Ve3vSH45pfik00VS6KobM9');

// 付款表單組件 - 生產環境版本
const CheckoutForm = ({ 
  amount, 
  onSuccess, 
  onCancel, 
  estimate,
  customerInfo 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isStripeLoaded, setIsStripeLoaded] = useState(false);

  // 檢查 Stripe 加載狀態
  useEffect(() => {
    if (stripe && elements) {
      setIsStripeLoaded(true);
      console.log('✅ Stripe and Elements loaded successfully');
    } else {
      console.log('⏳ Stripe or Elements not loaded yet');
    }
  }, [stripe, elements]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError('Payment system not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const depositAmount = Math.round(amount * 100);
      
      console.log('Creating payment intent for amount:', depositAmount);

      // 使用正式 API 端點
      const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: depositAmount,
          currency: 'cad',
          customer_email: customerInfo.email,
          description: `Deposit for ${estimate.service} - Greenpro Environmental Ltd.`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Payment failed');
      }

      if (!data.clientSecret) {
        throw new Error('No client secret received from server');
      }

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
          },
        }
      });

      if (result.error) {
        setError(result.error.message);
        setIsProcessing(false);
      } else {
        console.log('Payment succeeded:', result.paymentIntent);
        onSuccess(result.paymentIntent);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">Secure Payment - Deposit</h3>
        
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded">
          <div className="flex justify-between text-sm">
            <span>Service:</span>
            <span>{estimate.service}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Estimate:</span>
            <span>${estimate.totalEstimate.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Discount (5%):</span>
            <span className="text-green-600">-${(estimate.totalEstimate * 0.05).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold border-t mt-2 pt-2">
            <span>Deposit Amount (50%):</span>
            <span className="text-emerald-700">${amount.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <div className="border-2 border-blue-300 rounded-md p-3 min-h-[60px] bg-white">
              {!isStripeLoaded ? (
                <div className="flex items-center justify-center h-8 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                  Loading secure payment form...
                </div>
              ) : (
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                        backgroundColor: 'white',
                      },
                    },
                    hidePostalCode: true,
                  }}
                />
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded disabled:opacity-50"
              disabled={!stripe || !isStripeLoaded || isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500">
          <p>🔒 Your payment is secure and encrypted</p>
          <p className="mt-1">Stripe Status: {isStripeLoaded ? '✅ Loaded' : '⏳ Loading...'}</p>
        </div>
      </div>
    </div>
  );
};

const GreenPro = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Interior Demolition',
    area: '',
    rooms: '',
    description: ''
  });
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: null,
    time: '',
    service: 'Interior Demolition'
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [showEstimate, setShowEstimate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimateCount, setEstimateCount] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // 從 localStorage 加載估算計數
  useEffect(() => {
    const savedCount = localStorage.getItem('greenpro_estimate_count');
    if (savedCount) {
      setEstimateCount(parseInt(savedCount, 10));
    }

    // 設置當前年份
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
      currentYearElement.textContent = new Date().getFullYear();
    }
    
    // 平滑滾動
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
        setIsMenuOpen(false);
      });
    });
  }, []);

  // 添加估算計算函數
  const calculateEstimate = (service, area, rooms) => {
    let basePrice = 0;
    let ratePerSqFt = 0;
    
    switch(service) {
      case 'Interior Demolition':
        basePrice = 300;
        ratePerSqFt = 2.5;
        break;
      case 'Drywall Removal':
        basePrice = 200;
        ratePerSqFt = 1.8;
        break;
      case 'Site Clean-Up':
        basePrice = 150;
        ratePerSqFt = 1.2;
        break;
      case 'Garbage Removal':
        basePrice = 250;
        ratePerSqFt = 2.0;
        break;
      default:
        basePrice = 200;
        ratePerSqFt = 1.5;
    }
    
    const areaCost = area ? (parseFloat(area) * ratePerSqFt) : 0;
    const roomFee = rooms ? (parseInt(rooms) * 50) : 0;
    const totalEstimate = basePrice + areaCost + roomFee;
    
    return {
      basePrice,
      areaCost,
      roomFee,
      totalEstimate,
      ratePerSqFt
    };
  };

  // 添加重置估算函數
  const resetEstimate = () => {
    setShowEstimate(false);
    setEstimate(null);
    setPaymentSuccess(false);
    setShowPayment(false);
    setQuoteForm({
      name: '',
      phone: '',
      email: '',
      service: 'Interior Demolition',
      area: '',
      rooms: '',
      description: ''
    });
  };

  // 計算折扣後的訂金金額 - 修復為 50%
  const calculateDepositAmount = () => {
    if (!estimate || !estimate.totalEstimate) {
      console.error('沒有估算數據');
      return 0;
    }
    
    const total = estimate.totalEstimate;
    // 明確計算步驟
    const discountAmount = total * 0.05;      // 5% 折扣金額
    const afterDiscount = total - discountAmount; // 折扣後價格
    const depositAmount = afterDiscount * 0.5;    // 50% 訂金
    
    console.log('🎯 訂金計算詳情:');
    console.log('   總價:', total);
    console.log('   5% 折扣:', discountAmount);
    console.log('   折扣後:', afterDiscount);
    console.log('   50% 訂金:', depositAmount);
    
    return depositAmount;
  };

  // Formspree 提交函數
  const submitToFormspree = async (formData, formType, estimateData = null, paymentInfo = null) => {
    setIsSubmitting(true);
    
    try {
      const formattedData = {
        ...formData,
        _subject: `${formType} - ${formData.service} - Greenpro Environmental Ltd.`,
        _replyto: formData.email,
        formType: formType,
        date: formData.date ? formData.date.toLocaleDateString() : '',
        estimate: estimateData ? estimateData.totalEstimate.toFixed(2) : '',
        discountedEstimate: estimateData ? (estimateData.totalEstimate * 0.95).toFixed(2) : '',
        depositPaid: paymentInfo ? 'Yes' : 'No',
        depositAmount: paymentInfo ? calculateDepositAmount().toFixed(2) : '0',
        paymentId: paymentInfo ? paymentInfo.id : 'None',
        timestamp: new Date().toISOString()
      };

      const response = await fetch('https://formspree.io/f/xeobqzyr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        const successMessage = formType === 'quote' 
          ? (paymentInfo 
              ? 'Deposit paid successfully! You have received a 5% discount. We will contact you shortly to schedule.'
              : 'Quote request submitted successfully! We will contact you soon.')
          : 'Booking request submitted successfully! We will contact you to confirm.';
        
        setFormSuccess(successMessage);
        return true;
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setFormSuccess(`There was an error submitting your ${formType}. Please try again or contact us directly.`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 處理付款成功
  const handlePaymentSuccess = async (paymentIntent) => {
    setPaymentSuccess(true);
    setShowPayment(false);
    
    // 更新估算計數
    const newCount = estimateCount + 1;
    setEstimateCount(newCount);
    localStorage.setItem('greenpro_estimate_count', newCount.toString());

    // 提交報價請求並包含付款信息
    await submitToFormspree(quoteForm, 'quote', estimate, paymentIntent);
    
    setTimeout(() => setFormSuccess(''), 8000);
  };

  // Handle quote form input changes
  const handleQuoteInputChange = (e) => {
    const { name, value } = e.target;
    setQuoteForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle booking form input changes
  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle date change for DatePicker
  const handleDateChange = (date) => {
    setBookingForm(prev => ({
      ...prev,
      date: date
    }));
    
    if (formErrors.date) {
      setFormErrors(prev => ({
        ...prev,
        date: ''
      }));
    }
  };

  // Form validation
  const validateForm = (formData, formType) => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formType === 'booking' && !formData.date) {
      errors.date = 'Date is required';
    }
    
    if (formType === 'booking' && !formData.time) {
      errors.time = 'Time is required';
    }
    
    return errors;
  };

  // 修改 handleQuoteSubmit 函數
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(quoteForm, 'quote');
    
    if (Object.keys(errors).length === 0) {
      const estimateData = calculateEstimate(
        quoteForm.service, 
        quoteForm.area, 
        quoteForm.rooms
      );
      
      setEstimate(estimateData);
      setShowEstimate(true);
      
      // 提交估算統計數據
      const newCount = estimateCount + 1;
      setEstimateCount(newCount);
      localStorage.setItem('greenpro_estimate_count', newCount.toString());

      if (quoteForm.name && quoteForm.email) {
        setFormSuccess('Estimate calculated successfully! You can now pay a deposit to receive 5% discount.');
        setTimeout(() => setFormSuccess(''), 5000);
      } else {
        setFormSuccess('Estimate calculated successfully! Fill in your contact details to receive the full quote.');
        setTimeout(() => setFormSuccess(''), 5000);
      }
    } else {
      setFormErrors(errors);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(bookingForm, 'booking');
    
    if (Object.keys(errors).length === 0) {
      const success = await submitToFormspree(bookingForm, 'booking');
      
      if (success) {
        setBookingForm({
          name: '',
          phone: '',
          email: '',
          date: null,
          time: '',
          service: 'Interior Demolition'
        });
        
        setTimeout(() => setFormSuccess(''), 5000);
      }
    } else {
      setFormErrors(errors);
    }
  };

  // 處理確認和預約
  const handleConfirmAndSchedule = async () => {
    if (estimate && quoteForm.name && quoteForm.email) {
      const success = await submitToFormspree(quoteForm, 'quote', estimate);
      if (success) {
        alert('Our team will contact you shortly to confirm details and schedule!');
        resetEstimate();
      }
    } else {
      alert('Please fill in your contact details to confirm and schedule.');
    }
  };

  // 處理支付訂金 - 修復版本
  const handlePayDeposit = () => {
    console.log('handlePayDeposit called');
    if (!quoteForm.name || !quoteForm.email) {
      alert('Please fill in your name and email before making a payment.');
      return;
    }
    console.log('Setting showPayment to true');
    setShowPayment(true);
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="font-sans text-gray-800 relative">
        {/* ================= GOOGLE ADS 優化頭部 ================= */}
        <header className="bg-white shadow sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/greenpro_logo.png" 
                alt="Greenpro Environmental Ltd. Logo" 
                className="h-10 w-10 object-contain"
              />
              <div className="font-extrabold text-xl">
                GreenPro Environmental
              </div>
            </div>

            <nav className="hidden md:flex gap-4">
              <a
                href="#quote"
                className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-500 transition-colors"
              >
                Get Estimate
              </a>
              <a
                href="tel:7788367218"
                className="border border-emerald-600 text-emerald-700 px-4 py-2 rounded hover:bg-emerald-50 transition-colors"
              >
                Call Now
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden flex flex-col justify-center items-center w-8 h-8"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
              <span className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={`md:hidden bg-white shadow-lg transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-48 py-4' : 'max-h-0 py-0'} overflow-hidden`}>
            <div className="max-w-6xl mx-auto px-6 flex flex-col space-y-4">
              <a 
                href="#quote" 
                className="bg-yellow-400 text-black px-4 py-3 rounded font-bold text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Estimate
              </a>
              <a 
                href="tel:7788367218" 
                className="border border-emerald-600 text-emerald-700 px-4 py-3 rounded text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Call Now
              </a>
              <a href="#services" className="hover:underline py-2" onClick={() => setIsMenuOpen(false)}>Services</a>
              <a href="#book" className="hover:underline py-2" onClick={() => setIsMenuOpen(false)}>Book Online</a>
            </div>
          </div>
        </header>

        {/* Success Message */}
        {formSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md">
            {formSuccess}
          </div>
        )}

        {/* Payment Form */}
        {showPayment && estimate && (
          <CheckoutForm
            amount={calculateDepositAmount()}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPayment(false)}
            estimate={estimate}
            customerInfo={quoteForm}
          />
        )}

        {/* ================= 緊急服務英雄區塊 - GOOGLE ADS 優化 ================= */}
        <section className="bg-emerald-700 text-white py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Emergency Asbestos & Environmental Services
            </h1>

            <p className="text-lg md:text-xl mb-6">
              24–48 Hour Priority Response · Licensed · Insured · Compliant
            </p>

            <div className="flex flex-col md:flex-row justify-center gap-4">
              <a
                href="#quote"
                className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-bold text-xl hover:bg-yellow-500 transition-colors"
              >
                ⚡ Pay Deposit & Lock Priority
              </a>

              <a
                href="tel:7788367218"
                className="bg-black px-8 py-4 rounded-lg font-bold text-xl hover:bg-gray-800 transition-colors inline-flex items-center justify-center"
              >
                📞 Call Now for Immediate Help
              </a>
            </div>

            <p className="text-sm mt-6 text-emerald-100">
              Serving Vancouver, Burnaby, Richmond, Surrey, and Greater Vancouver.
            </p>
          </div>
        </section>

        {/* ================= 目標客戶區塊 ================= */}
        <section className="py-12 px-6 bg-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-4">
              This Emergency Service Is For:
            </h3>

            <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                <span>Renovation stopped due to asbestos</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                <span>Property sale requiring inspection</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                <span>Emergency demolition or contamination</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                <span>Contractor compliance issues</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 報價區塊 - 優先位置 ================= */}
        <section id="quote" className="py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-2 text-center">
              Get Priority Service (Instant Estimate)
            </h2>

            <p className="text-center text-gray-600 mb-4">
              Secure priority scheduling with a refundable deposit.
            </p>

            <p className="text-xs text-center text-gray-500 mb-8">
              💡 Tip: You can secure priority first. Final details can be confirmed on-site.
            </p>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-2xl font-bold mb-3">Request a Quote</h3>
              <p className="text-sm text-gray-600 mb-4">Fill the form and get an instant estimate. We'll contact you with details.</p>

              {showEstimate ? (
                // 顯示估算結果
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-emerald-800 mb-4">Your Estimate</h4>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span>Base Price ({quoteForm.service}):</span>
                      <span>${estimate.basePrice.toFixed(2)}</span>
                    </div>
                    {quoteForm.area && (
                      <div className="flex justify-between">
                        <span>Area Cost ({quoteForm.area} sq ft × ${estimate.ratePerSqFt}/sq ft):</span>
                        <span>${estimate.areaCost.toFixed(2)}</span>
                      </div>
                    )}
                    {quoteForm.rooms && (
                      <div className="flex justify-between">
                        <span>Room Fee ({quoteForm.rooms} rooms × $50/room):</span>
                        <span>${estimate.roomFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Estimate:</span>
                        <span className="text-emerald-700">${estimate.totalEstimate.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* 折扣信息 */}
                    {!paymentSuccess && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
                          <span>🎉 Special Offer!</span>
                        </div>
                        <div className="text-sm text-yellow-700">
                          <p>Pay 50% deposit now and get <strong>5% discount</strong> on your total!</p>
                          <div className="flex justify-between mt-2">
                            <span>Discounted Total:</span>
                            <span className="font-bold">${(estimate.totalEstimate * 0.95).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Deposit Amount (50%):</span>
                            <span className="font-bold text-emerald-700">${calculateDepositAmount().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 付款成功顯示 */}
                    {paymentSuccess && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                          <span>✅ Deposit Paid!</span>
                        </div>
                        <div className="text-sm text-green-700">
                          <p>Thank you! You've received a <strong>5% discount</strong>. Your discounted total is <strong>${(estimate.totalEstimate * 0.95).toFixed(2)}</strong>.</p>
                          <p className="mt-1">We'll contact you shortly to schedule your service.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    * This is an approximate estimate. Final pricing may vary based on project complexity and site conditions.
                  </p>
                  
                  <div className="flex gap-3 flex-wrap">
                    <button 
                      onClick={resetEstimate}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                    >
                      New Estimate
                    </button>
                    
                    {!paymentSuccess && (
                      <button 
                        onClick={handlePayDeposit}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded flex items-center gap-2 transition-colors font-bold"
                      >
                        <span>💰</span>
                        Pay Deposit & Get 5% Off
                      </button>
                    )}
                    
                    <button 
                      onClick={handleConfirmAndSchedule}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      {paymentSuccess ? 'Schedule Service' : 'Confirm & Schedule'}
                    </button>
                  </div>
                </div>
              ) : (
                // 顯示估算表單
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleQuoteSubmit}>
                  <div>
                    <input 
                      name="name" 
                      placeholder="Full name" 
                      className={`border p-3 rounded w-full ${formErrors.name ? 'border-red-500' : ''}`} 
                      value={quoteForm.name}
                      onChange={handleQuoteInputChange}
                      required 
                    />
                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                  </div>
                  
                  <div>
                    <input 
                      name="phone" 
                      placeholder="Phone" 
                      className={`border p-3 rounded w-full ${formErrors.phone ? 'border-red-500' : ''}`} 
                      value={quoteForm.phone}
                      onChange={handleQuoteInputChange}
                      required 
                    />
                    {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <input 
                      name="email" 
                      placeholder="Email" 
                      className={`border p-3 rounded w-full ${formErrors.email ? 'border-red-500' : ''}`} 
                      type="email" 
                      value={quoteForm.email}
                      onChange={handleQuoteInputChange}
                      required 
                    />
                    {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <select 
                      name="service" 
                      className="border p-3 rounded w-full"
                      value={quoteForm.service}
                      onChange={handleQuoteInputChange}
                    >
                      <option>Interior Demolition</option>
                      <option>Drywall Removal</option>
                      <option>Site Clean-Up</option>
                      <option>Garbage Removal</option>
                    </select>
                  </div>
                  
                  <div>
                    <input 
                      name="area" 
                      placeholder="Approx area (sq ft)" 
                      className="border p-3 rounded w-full"
                      type="number"
                      min="0"
                      value={quoteForm.area}
                      onChange={handleQuoteInputChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional - for more accurate estimate</p>
                  </div>
                  
                  <div>
                    <input 
                      name="rooms" 
                      placeholder="# rooms" 
                      className="border p-3 rounded w-full"
                      type="number"
                      min="0"
                      value={quoteForm.rooms}
                      onChange={handleQuoteInputChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional - for more accurate estimate</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <textarea 
                      name="description" 
                      placeholder="Project details, hazards, access notes" 
                      className="border p-3 rounded w-full"
                      value={quoteForm.description}
                      onChange={handleQuoteInputChange}
                    ></textarea>
                  </div>

                  <div className="flex gap-3 md:col-span-2">
                    <button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded flex items-center justify-center min-w-[120px] transition-colors" 
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Get Estimate'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ================= 信任建立區塊 ================= */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Greenpro</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-3">Licensed & Insured</h3>
                <p className="text-gray-600">
                  Fully compliant with safety and environmental regulations. Peace of mind for residential and commercial projects.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-3">Fast Response</h3>
                <p className="text-gray-600">
                  Priority service for urgent projects. We aim to be on-site within 24-48 hours for emergency situations.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-3">Clear Pricing</h3>
                <p className="text-gray-600">
                  No hidden fees. Deposit applied to final project cost. Transparent estimates with detailed breakdowns.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl mb-4">🏗️</div>
                <h3 className="text-xl font-semibold mb-2">Interior Demolition</h3>
                <p className="text-gray-600">Safe and efficient removal of interior structures, walls, and fixtures.</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl mb-4">🧱</div>
                <h3 className="text-xl font-semibold mb-2">Drywall Removal</h3>
                <p className="text-gray-600">Professional drywall and gypsum board removal with minimal dust.</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl mb-4">🧹</div>
                <h3 className="text-xl font-semibold mb-2">Site Clean-Up</h3>
                <p className="text-gray-600">Thorough site cleanup and debris removal after construction or renovation.</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl mb-4">🚛</div>
                <h3 className="text-xl font-semibold mb-2">Garbage Removal</h3>
                <p className="text-gray-600">Eco-friendly disposal of construction waste and other materials.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 工作流程 ================= */}
        <section className="bg-emerald-50 py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-700 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 text-lg font-bold">1</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Request Estimate or Pay Deposit</h3>
                  <p className="text-gray-700">Get an instant quote or secure priority scheduling with a 50% deposit (get 5% discount).</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-emerald-700 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 text-lg font-bold">2</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">We Contact You Within 24 Hours</h3>
                  <p className="text-gray-700">Our team reaches out to confirm details and answer any questions.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-emerald-700 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 text-lg font-bold">3</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">On-Site Assessment</h3>
                  <p className="text-gray-700">We visit your site to evaluate the project scope and provide final pricing.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-emerald-700 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 text-lg font-bold">4</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Clear Scope & Pricing</h3>
                  <p className="text-gray-700">We provide a detailed scope of work and final pricing for your approval.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-emerald-700 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 text-lg font-bold">5</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Proceed Only If You Approve</h3>
                  <p className="text-gray-700">Work begins only after you give the green light. No surprises.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Our Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-200 rounded-lg aspect-video overflow-hidden">
                <img 
                  src="/assets/gallery/demolition-1.jpg" 
                  alt="Demolition work"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="bg-gray-200 rounded-lg aspect-video overflow-hidden">
                <img 
                  src="/assets/gallery/cleanup-1.jpg" 
                  alt="Clean-up service"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="bg-gray-200 rounded-lg aspect-video overflow-hidden">
                <img 
                  src="/assets/gallery/waste-removal-1.jpg" 
                  alt="Waste removal"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="bg-gray-200 rounded-lg aspect-video overflow-hidden">
                <img 
                  src="/assets/gallery/project-complete-1.jpg" 
                  alt="Project completion"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="bg-gray-200 rounded-lg aspect-video overflow-hidden">
                <img 
                  src="/assets/gallery/team-work-1.jpg" 
                  alt="Team at work"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="bg-gray-200 rounded-lg aspect-video overflow-hidden">
                <img 
                  src="/assets/gallery/eco-disposal-1.jpg" 
                  alt="Eco-friendly disposal"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section id="book" className="py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-2xl font-bold mb-3">Online Booking</h3>
              <p className="text-sm text-gray-600 mb-4">Choose a date and time and we'll confirm availability.</p>
              <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input 
                    name="name" 
                    placeholder="Full name" 
                    className={`border p-3 rounded w-full ${formErrors.name ? 'border-red-500' : ''}`} 
                    value={bookingForm.name}
                    onChange={handleBookingInputChange}
                    required 
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                
                <div>
                  <input 
                    name="phone" 
                    placeholder="Phone" 
                    className={`border p-3 rounded w-full ${formErrors.phone ? 'border-red-500' : ''}`} 
                    value={bookingForm.phone}
                    onChange={handleBookingInputChange}
                    required 
                  />
                  {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <input 
                    name="email" 
                    placeholder="Email" 
                    className={`border p-3 rounded w-full ${formErrors.email ? 'border-red-500' : ''}`} 
                    type="email" 
                    value={bookingForm.email}
                    onChange={handleBookingInputChange}
                    required 
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>
                
                {/* 日期和時間選擇器 */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                  <DatePicker
                    selected={bookingForm.date}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    placeholderText="Select a date"
                    className={`border p-3 rounded w-full ${formErrors.date ? 'border-red-500' : 'border-gray-300'}`}
                    required
                    dateFormat="MMMM d, yyyy"
                    showPopperArrow={false}
                    popperPlacement="bottom-start"
                  />
                  {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
                </div>
                
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                  <select 
                    name="time" 
                    className={`border p-3 rounded w-full ${formErrors.time ? 'border-red-500' : 'border-gray-300'}`}
                    value={bookingForm.time}
                    onChange={handleBookingInputChange}
                    required
                  >
                    <option value="">Select a time</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                  {formErrors.time && <p className="text-red-500 text-sm mt-1">{formErrors.time}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <select 
                    name="service" 
                    className="border p-3 rounded w-full"
                    value={bookingForm.service}
                    onChange={handleBookingInputChange}
                  >
                    <option>Interior Demolition</option>
                    <option>Drywall Removal</option>
                    <option>Site Clean-Up</option>
                    <option>Garbage Removal</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded flex items-center justify-center w-full transition-colors" 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Request Booking'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* ================= 緊急聯繫 CTA ================= */}
        <section id="contact" className="py-16 px-6 text-center bg-emerald-700 text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Need Immediate Help?
            </h2>

            <p className="text-emerald-100 mb-6">
              Call or message us now for urgent service.
            </p>

            <a
              href="tel:7788367218"
              className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-bold text-xl hover:bg-yellow-500 transition-colors inline-block mb-6"
            >
              📞 Call Now: 778-836-7218
            </a>
            
            <div className="mt-8">
              <p className="text-sm text-emerald-100">
                Email: info@greenprogroup.com<br/>
                Greenpro Environmental Ltd. — Licensed, insured, and committed to eco-friendly disposal.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-emerald-800 text-white py-6">
          <div className="max-w-6xl mx-auto px-6 text-center text-sm">
            © <span id="current-year"></span> Greenpro Environmental Ltd. • 778-836-7218 • info@greenprogroup.com
          </div>
        </footer>

        {/* ================= 移動端固定底欄 ================= */}
        <div className="fixed bottom-0 left-0 right-0 bg-emerald-700 text-white flex justify-between items-center px-4 py-3 md:hidden z-50 shadow-lg">
          <a href="tel:7788367218" className="font-bold flex items-center gap-2">
            <span>📞</span>
            Call Now
          </a>
          <a
            href="#quote"
            className="bg-yellow-400 text-black px-4 py-2 rounded font-bold"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Pay Deposit
          </a>
        </div>
      </div>
    </Elements>
  );
};

export default GreenPro;