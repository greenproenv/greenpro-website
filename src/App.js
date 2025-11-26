// GreenPro.jsx
import GreenPro from './GreenPro';
import React, { useEffect } from 'react';

const GreenPro = () => {
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
      });
    });

    // Cleanup function
    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', () => {});
      });
    };
  }, []);

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    alert('Quote request submitted! We will contact you soon.');
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    alert('Booking request submitted! We will contact you to confirm.');
  };

  return (
    <div className="font-sans text-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-700 to-green-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">GP</div>
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
      // 創建一個圖片組件
const GalleryImage = ({ src, alt }) => (
  <div className="bg-gray-200 rounded-lg aspect-video overflow-hidden">
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  </div>
);
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
              <span className="text-gray-500">Demolition work</span>
            </div>
            <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
              <span className="text-gray-500">Clean-up service</span>
            </div>
            <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
              <span className="text-gray-500">Waste removal</span>
            </div>
            <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
              <span className="text-gray-500">Project completion</span>
            </div>
            <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
              <span className="text-gray-500">Team at work</span>
            </div>
            <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
              <span className="text-gray-500">Eco-friendly disposal</span>
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

            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleQuoteSubmit}>
              <input name="name" placeholder="Full name" className="border p-3 rounded" required />
              <input name="phone" placeholder="Phone" className="border p-3 rounded" required />
              <input name="email" placeholder="Email" className="border p-3 rounded md:col-span-2" type="email" required />
              <select name="service" className="border p-3 rounded md:col-span-2">
                <option>Interior Demolition</option>
                <option>Drywall Removal</option>
                <option>Site Clean-Up</option>
                <option>Garbage Removal</option>
              </select>
              <input name="area" placeholder="Approx area (sq ft)" className="border p-3 rounded" />
              <input name="rooms" placeholder="# rooms" className="border p-3 rounded" />
              <textarea name="description" placeholder="Project details, hazards, access notes" className="border p-3 rounded md:col-span-2"></textarea>

              <div className="flex gap-3 md:col-span-2">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded" type="submit">Get Estimate</button>
              </div>
            </form>
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
              <input name="name" placeholder="Full name" className="border p-3 rounded" required />
              <input name="phone" placeholder="Phone" className="border p-3 rounded" required />
              <input name="email" placeholder="Email" className="border p-3 rounded md:col-span-2" type="email" required />
              <input type="date" name="date" className="border p-3 rounded" required />
              <input type="time" name="time" className="border p-3 rounded" required />
              <select name="service" className="border p-3 rounded md:col-span-2">
                <option>Interior Demolition</option>
                <option>Drywall Removal</option>
                <option>Site Clean-Up</option>
                <option>Garbage Removal</option>
              </select>

              <div className="md:col-span-2">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded">Request Booking</button>
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

const [isMenuOpen, setIsMenuOpen] = useState(false);

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