function App() {
  return (
    <div className="p-8">
      <div className="bg-red-500 text-white p-4 rounded mb-4">
        测试：如果这是红色背景，Tailwind 基础样式工作正常
      </div>
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded">
        测试：如果这是渐变背景，Tailwind 渐变功能工作正常
      </div>
    </div>
  );
}

import React, { useState } from 'react';

/*
  Modern single-page Greenpro Environmental website
  - TailwindCSS for styling (already in your project)
  - Placeholder gallery section (drop images into public/assets/gallery/)
  - Quote form that calls /api/estimate -> returns estimate and triggers auto-reply
  - Booking form that calls /api/book -> schedules appointments
  - Payment button that calls /api/create-checkout-session (Stripe)

  NOTE: This is a frontend component only. Backend endpoints expected:
    POST /api/estimate  -> accepts form JSON, returns { estimate_low, estimate_high, currency, explanation }
    POST /api/book      -> accepts booking JSON, returns { success: true }
    POST /api/create-checkout-session -> accepts { amount, email }, returns { url }
*/

const PUBLIC_LOGO_PATH = '/assets/greenpro-logo.png';

const fallbackSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <rect width='100%' height='100%' rx='30' ry='30' fill='#16a34a'/>
  <text x='50%' y='56%' font-family='Verdana,Arial,sans-serif' font-size='64' fill='white' text-anchor='middle' alignment-baseline='middle'>GP</text>
</svg>`;
const FALLBACK_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(fallbackSvg)}`;

function Header() {
  return (
    <header className="bg-gradient-to-r from-emerald-700 to-green-600 text-white">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={PUBLIC_LOGO_PATH}
            alt="logo"
            className="h-12 w-auto object-contain"
            onError={(e) => {
              if (e && e.currentTarget) {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_DATA_URI;
              }
            }}
          />
          <div>
            <h1 className="text-2xl font-bold">Greenpro Environmental Ltd.</h1>
            <p className="text-sm">Demolition • Drywall removal • Clean-up • Waste removal</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#services" className="hover:underline">Services</a>
          <a href="#quote" className="hover:underline">Get a Quote</a>
          <a href="#book" className="hover:underline">Book</a>
          <a href="#contact" className="border border-white px-3 py-2 rounded-md">Contact</a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
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
  );
}

function Services() {
  const services = [
    {
      title: "Interior Demolition",
      description: "Safe and efficient removal of interior structures, walls, and fixtures.",
      icon: "🏗️"
    },
    {
      title: "Drywall Removal",
      description: "Professional drywall and gypsum board removal with minimal dust.",
      icon: "🧱"
    },
    {
      title: "Site Clean-Up",
      description: "Thorough site cleanup and debris removal after construction or renovation.",
      icon: "🧹"
    },
    {
      title: "Garbage Removal",
      description: "Eco-friendly disposal of construction waste and other materials.",
      icon: "🚛"
    }
  ];

  return (
    <section id="services" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  // This would normally map through images in your public/assets/gallery/ directory
  const placeholderImages = [
    { id: 1, alt: "Demolition work" },
    { id: 2, alt: "Clean-up service" },
    { id: 3, alt: "Waste removal" },
    { id: 4, alt: "Project completion" },
    { id: 5, alt: "Team at work" },
    { id: 6, alt: "Eco-friendly disposal" }
  ];

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Our Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {placeholderImages.map((image) => (
            <div key={image.id} className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
              <span className="text-gray-500">Image: {image.alt}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function App() {
  // Quote form state
  const [q, setQ] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Interior Demolition',
    area: '',
    rooms: '',
    description: ''
  });
  const [estimate, setEstimate] = useState(null);
  const [loadingEst, setLoadingEst] = useState(false);
  const [message, setMessage] = useState('');

  // Booking form state
  const [booking, setBooking] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service: 'Interior Demolition'
  });
  const [bookingMsg, setBookingMsg] = useState('');

  async function getEstimate(e) {
    e?.preventDefault();
    setLoadingEst(true);
    setMessage('');
    try {
      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      });
      if (!res.ok) throw new Error('Estimate failed');
      const data = await res.json();
      setEstimate(data.estimate || data);
      setMessage('A confirmation email has been sent to the customer (auto-reply).');
    } catch (err) {
      console.error(err);
      setMessage('Could not get estimate now.');
    } finally {
      setLoadingEst(false);
    }
  }

  async function payDeposit() {
    // Example: use typical deposit = 20% of estimate_typical
    const typical = estimate?.estimate_typical || estimate?.fixed || 200;
    const amount = Math.round(typical * 0.2) * 100; // cents
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, email: q.email })
      });
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert('Payment failed to start');
    }
  }

  async function submitBooking(e) {
    e?.preventDefault();
    setBookingMsg('');
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });
      if (!res.ok) throw new Error('Booking failed');
      setBookingMsg('Booking received — we will contact you to confirm.');
    } catch (err) {
      console.error(err);
      setBookingMsg('Booking could not be submitted.');
    }
  }

  return (
    <div className="font-sans text-gray-800">
      <Header />
      <main>
        <Hero />
        <Services />
        <Gallery />

        <section id="quote" className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-2xl font-bold mb-3">Request a Quote</h3>
              <p className="text-sm text-gray-600 mb-4">Fill the form and get an instant AI-assisted estimate. We'll also send an automated email reply to the customer.</p>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={getEstimate}>
                <input name="name" value={q.name} onChange={(e) => setQ({ ...q, name: e.target.value })} placeholder="Full name" className="border p-3 rounded" />
                <input name="phone" value={q.phone} onChange={(e) => setQ({ ...q, phone: e.target.value })} placeholder="Phone" className="border p-3 rounded" />
                <input name="email" value={q.email} onChange={(e) => setQ({ ...q, email: e.target.value })} placeholder="Email" className="border p-3 rounded md:col-span-2" />
                <select name="service" value={q.service} onChange={(e) => setQ({ ...q, service: e.target.value })} className="border p-3 rounded md:col-span-2">
                  <option>Interior Demolition</option>
                  <option>Drywall Removal</option>
                  <option>Site Clean-Up</option>
                  <option>Garbage Removal</option>
                </select>
                <input name="area" value={q.area} onChange={(e) => setQ({ ...q, area: e.target.value })} placeholder="Approx area (sq ft)" className="border p-3 rounded" />
                <input name="rooms" value={q.rooms} onChange={(e) => setQ({ ...q, rooms: e.target.value })} placeholder="# rooms" className="border p-3 rounded" />
                <textarea name="description" value={q.description} onChange={(e) => setQ({ ...q, description: e.target.value })} placeholder="Project details, hazards, access notes" className="border p-3 rounded md:col-span-2" />

                <div className="flex gap-3 md:col-span-2">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded" type="submit" disabled={loadingEst}>{loadingEst ? 'Calculating...' : 'Get Estimate'}</button>
                  {estimate && <button type="button" onClick={payDeposit} className="border px-4 py-2 rounded">Pay Deposit</button>}
                </div>

                <div className="md:col-span-2 mt-2">
                  {estimate && (
                    <div className="p-3 border rounded bg-green-50">
                      <strong>Estimate:</strong> {estimate.estimate_low} - {estimate.estimate_high} {estimate.currency || 'CAD'}
                      <p className="text-sm text-gray-600 mt-1">{estimate.explanation}</p>
                    </div>
                  )}
                  {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
                </div>
              </form>
            </div>
          </div>
        </section>

        <section id="book" className="py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-2xl font-bold mb-3">Online Booking</h3>
              <p className="text-sm text-gray-600 mb-4">Choose a date and time and we'll confirm availability.</p>
              <form onSubmit={submitBooking} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" value={booking.name} onChange={(e) => setBooking({ ...booking, name: e.target.value })} placeholder="Full name" className="border p-3 rounded" />
                <input name="phone" value={booking.phone} onChange={(e) => setBooking({ ...booking, phone: e.target.value })} placeholder="Phone" className="border p-3 rounded" />
                <input name="email" value={booking.email} onChange={(e) => setBooking({ ...booking, email: e.target.value })} placeholder="Email" className="border p-3 rounded md:col-span-2" />
                <input type="date" name="date" value={booking.date} onChange={(e) => setBooking({ ...booking, date: e.target.value })} className="border p-3 rounded" />
                <input type="time" name="time" value={booking.time} onChange={(e) => setBooking({ ...booking, time: e.target.value })} className="border p-3 rounded" />
                <select name="service" value={booking.service} onChange={(e) => setBooking({ ...booking, service: e.target.value })} className="border p-3 rounded md:col-span-2">
                  <option>Interior Demolition</option>
                  <option>Drywall Removal</option>
                  <option>Site Clean-Up</option>
                  <option>Garbage Removal</option>
                </select>

                <div className="md:col-span-2">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded">Request Booking</button>
                  {bookingMsg && <p className="text-sm text-gray-600 mt-2">{bookingMsg}</p>}
                </div>
              </form>
            </div>
          </div>
        </section>

        <section id="contact" className="py-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-2xl font-bold mb-2">Contact</h3>
            <p className="text-sm text-gray-600">Phone: 778-836-7218 • Email: info@greenprogroup.com</p>
            <p className="text-sm text-gray-600 mt-2">Greenpro Environmental Ltd. — Licensed, insured, and committed to eco-friendly disposal.</p>
          </div>
        </section>

      </main>

      <footer className="bg-emerald-800 text-white py-6 mt-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm">
          © {new Date().getFullYear()} Greenpro Environmental Ltd. • 778-836-7218 • info@greenprogroup.com
        </div>
      </footer>
    </div>
  );
}

export default App;