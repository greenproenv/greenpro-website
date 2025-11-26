// src/GreenPro.jsx
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';

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

  // 從 localStorage 加載估算計數
  useEffect(() => {
    const savedCount = localStorage.getItem('greenpro_estimate_count');
    if (savedCount) {
      setEstimateCount(parseInt(savedCount, 10));
    }
  }, []);

  // 添加估算計算函數
  const calculateEstimate = (service, area, rooms) => {
    // 基礎價格
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
    
    // 計算面積費用
    const areaCost = area ? (parseFloat(area) * ratePerSqFt) : 0;
    
    // 房間附加費
    const roomFee = rooms ? (parseInt(rooms) * 50) : 0;
    
    // 總估算
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

  // Formspree 提交函數 - 專門用於估算統計
  const submitEstimateStat = async (estimateData, formData) => {
    try {
      // 更新本地估算計數
      const newCount = estimateCount + 1;
      setEstimateCount(newCount);
      localStorage.setItem('greenpro_estimate_count', newCount.toString());

      const estimateStatData = {
        _subject: `Estimate Request #${newCount} - Greenpro Environmental Ltd.`,
        _replyto: formData.email || 'no-email@greenpro.com',
        formType: 'estimate_statistics',
        estimateCount: newCount,
        service: formData.service,
        area: formData.area || 'Not specified',
        rooms: formData.rooms || 'Not specified',
        totalEstimate: estimateData.totalEstimate.toFixed(2),
        basePrice: estimateData.basePrice,
        areaCost: estimateData.areaCost,
        roomFee: estimateData.roomFee,
        customerName: formData.name || 'Anonymous',
        customerPhone: formData.phone || 'Not provided',
        customerEmail: formData.email || 'Not provided',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      const response = await fetch('https://formspree.io/f/xeobqzyr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(estimateStatData),
      });

      if (response.ok) {
        console.log('Estimate statistics submitted successfully');
        return true;
      } else {
        throw new Error('Estimate statistics submission failed');
      }
    } catch (error) {
      console.error('Estimate statistics submission error:', error);
      return false;
    }
  };

  // Formspree 提交函數 - 用於正式報價請求
  const submitQuoteRequest = async (formData, estimateData) => {
    setIsSubmitting(true);
    
    try {
      const formattedData = {
        ...formData,
        _subject: `Quote Request - ${formData.service} - Greenpro Environmental Ltd.`,
        _replyto: formData.email,
        formType: 'quote_request',
        estimate: estimateData.totalEstimate.toFixed(2),
        basePrice: estimateData.basePrice,
        areaCost: estimateData.areaCost,
        roomFee: estimateData.roomFee,
        ratePerSqFt: estimateData.ratePerSqFt,
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
        setFormSuccess('Quote request submitted successfully! We will contact you soon.');
        return true;
      } else {
        throw new Error('Quote request submission failed');
      }
    } catch (error) {
      console.error('Quote request submission error:', error);
      setFormSuccess('There was an error submitting your quote request. Please try again or contact us directly.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formspree 提交函數 - 用於預訂請求
  const submitBookingRequest = async (formData) => {
    setIsSubmitting(true);
    
    try {
      const formattedData = {
        ...formData,
        _subject: `Booking Request - ${formData.service} - Greenpro Environmental Ltd.`,
        _replyto: formData.email,
        formType: 'booking_request',
        date: formData.date ? formData.date.toLocaleDateString() : '',
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
        setFormSuccess('Booking request submitted successfully! We will contact you to confirm.');
        return true;
      } else {
        throw new Error('Booking request submission failed');
      }
    } catch (error) {
      console.error('Booking request submission error:', error);
      setFormSuccess('There was an error submitting your booking request. Please try again or contact us directly.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Smooth scrolling for anchor links
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
        // Close mobile menu when clicking a link
        setIsMenuOpen(false);
      });
    });

    // Cleanup function
    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', () => {});
      });
    };
  }, []);

  // Handle quote form input changes
  const handleQuoteInputChange = (e) => {
    const { name, value } = e.target;
    setQuoteForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
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
    
    // Clear error when user starts typing
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
    
    // Clear date error if any
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
      // 計算估算
      const estimateData = calculateEstimate(
        quoteForm.service, 
        quoteForm.area, 
        quoteForm.rooms
      );
      
      setEstimate(estimateData);
      setShowEstimate(true);
      
      // 提交估算統計數據（不等待完成）
      submitEstimateStat(estimateData, quoteForm);
      
      // 如果有聯繫信息，同時提交正式報價請求
      if (quoteForm.name && quoteForm.email) {
        await submitQuoteRequest(quoteForm, estimateData);
        
        // 清除成功消息 after 5 seconds
        setTimeout(() => setFormSuccess(''), 5000);
      } else {
        setFormSuccess('Estimate calculated successfully! Fill in your contact details to receive the full quote.');
        
        // 清除成功消息 after 5 seconds
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
      // 提交到 Formspree
      const success = await submitBookingRequest(bookingForm);
      
      if (success) {
        // Reset form
        setBookingForm({
          name: '',
          phone: '',
          email: '',
          date: null,
          time: '',
          service: 'Interior Demolition'
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => setFormSuccess(''), 5000);
      }
    } else {
      setFormErrors(errors);
    }
  };

  // 處理確認和預約
  const handleConfirmAndSchedule = async () => {
    if (estimate && quoteForm.name && quoteForm.email) {
      const success = await submitQuoteRequest(quoteForm, estimate);
      if (success) {
        alert('Our team will contact you shortly to confirm details and schedule!');
        resetEstimate();
      }
    } else {
      alert('Please fill in your contact details to confirm and schedule.');
    }
  };

  return (
    <div className="font-sans text-gray-800">
      {/* Header with Mobile Menu */}
      <header className="bg-gradient-to-r from-emerald-700 to-green-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">GP</div>
            <div>
              <h1 className="text-2xl font-bold">Greenpro Environmental Ltd.</h1>
              <p className="text-sm">Demolition • Drywall removal • Clean-up • Waste removal</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#services" className="hover:underline">Services</a>
            <a href="#quote" className="hover:underline">Get a Quote</a>
            <a href="#book" className="hover:underline">Book</a>
            <a href="#contact" className="border border-white px-3 py-2 rounded-md">Contact</a>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex flex-col justify-center items-center w-8 h-8"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
            <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        <div className={`md:hidden bg-emerald-800 transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-64 py-4' : 'max-h-0 py-0'} overflow-hidden`}>
          <div className="max-w-6xl mx-auto px-6 flex flex-col space-y-4">
            <a href="#services" className="hover:underline">Services</a>
            <a href="#quote" className="hover:underline">Get a Quote</a>
            <a href="#book" className="hover:underline">Book</a>
            <a href="#contact" className="border border-white px-3 py-2 rounded-md text-center">Contact</a>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {formSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {formSuccess}
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-emerald-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Safe. Fast. Environmentally Responsible.</h2>
          <p className="text-lg md:text-xl mb-6">Professional demolition, drywall removal, site clean-ups, and waste disposal across your area.</p>
          <div className="flex justify-center gap-4">
            <a href="#quote" className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-lg font-semibold">Request a Quote</a>
            <a href="#book" className="border border-white px-6 py-3 rounded-lg">Book Now</a>
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

      {/* Quote Section */}
      <section id="quote" className="py-16">
        <div className="max-w-4xl mx-auto px-6">
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
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  * This is an approximate estimate. Final pricing may vary based on project complexity and site conditions.
                </p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={resetEstimate}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    New Estimate
                  </button>
                  <button 
                    onClick={handleConfirmAndSchedule}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
                  >
                    Confirm & Schedule
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
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded flex items-center justify-center min-w-[120px]" 
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
              
              <div>
                <DatePicker
                  selected={bookingForm.date}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  placeholderText="Select date"
                  className={`border p-3 rounded w-full ${formErrors.date ? 'border-red-500' : ''}`}
                  required
                  dateFormat="MMMM d, yyyy"
                />
                {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
              </div>
              
              <div>
                <input 
                  type="time" 
                  name="time" 
                  className={`border p-3 rounded w-full ${formErrors.time ? 'border-red-500' : ''}`} 
                  value={bookingForm.time}
                  onChange={handleBookingInputChange}
                  required 
                />
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded flex items-center justify-center w-full" 
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

      {/* Contact Section */}
      <section id="contact" className="py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-2">Contact</h3>
          <p className="text-sm text-gray-600">Phone: 778-836-7218 • Email: info@greenprogroup.com</p>
          <p className="text-sm text-gray-600 mt-2">Greenpro Environmental Ltd. — Licensed, insured, and committed to eco-friendly disposal.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-800 text-white py-6 mt-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm">
          © <span id="current-year"></span> Greenpro Environmental Ltd. • 778-836-7218 • info@greenprogroup.com
        </div>
      </footer>
    </div>
  );
};

export default GreenPro;