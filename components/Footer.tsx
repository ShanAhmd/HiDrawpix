import React from 'react';
import { WHATSAPP_LINK, MAP_LOCATION_URL } from '../constants';

interface FooterProps {
  setView: (view: 'customer' | 'about' | 'terms') => void;
}

const Footer: React.FC<FooterProps> = ({ setView }) => {
  return (
    <footer className="bg-black bg-opacity-25 mt-16 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-accent mb-4">Hi Drawpix</h3>
            <p className="text-text-secondary">
              Your one-stop solution for creative design and development services. We bring your ideas to life with passion and precision.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Links</h3>
             <ul className="space-y-2 text-text-secondary">
              <li>
                <button onClick={() => setView('customer')} className="hover:text-accent transition-colors bg-transparent border-none text-left p-0">Home</button>
              </li>
              <li>
                <button onClick={() => setView('about')} className="hover:text-accent transition-colors bg-transparent border-none text-left p-0">About Us</button>
              </li>
              <li>
                <button onClick={() => setView('terms')} className="hover:text-accent transition-colors bg-transparent border-none text-left p-0">Terms & Conditions</button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Contact Us</h3>
            <ul className="space-y-2 text-text-secondary">
              <li>Email: shanahamedal20@gmail.com</li>
              <li>Phone: +94 76 289 6449</li>
              <li>Address: Kurunegala, Ridigama, Sri Lanka</li>
              <li>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                  Contact on WhatsApp
                </a>
              </li>
            </ul>
          </div>
          <div className="md:col-span-1">
             <h3 className="text-lg font-semibold text-text-primary mb-4">Our Location</h3>
             <div className="rounded-xl overflow-hidden border border-white border-opacity-20 h-32">
                <iframe
                    src={MAP_LOCATION_URL}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Hi Drawpix Location"
                ></iframe>
             </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white border-opacity-10 text-center text-text-secondary text-sm">
          <p>&copy; {new Date().getFullYear()} Hi Drawpix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
