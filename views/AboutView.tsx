import React from 'react';
import { SERVICES } from '../constants';

const AboutView: React.FC = () => {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="glass-card max-w-4xl mx-auto p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-accent mb-4 text-center">About Hi Drawpix</h1>
        <p className="text-center text-text-secondary mb-12">
          Your Creative Partner in Digital Design & Development.
        </p>

        <div className="space-y-8 text-text-secondary leading-relaxed">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">Our Mission</h2>
            <p>
              At Hi Drawpix, our mission is to bring your creative visions to life with unparalleled precision and passion. We believe that great design is a combination of artistry, strategy, and technology. We are dedicated to providing innovative and high-quality digital solutions that not only look stunning but also drive results and help your brand grow.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">Who We Are</h2>
            <p>
              We are a team of creative designers, developers, and strategists based in Sri Lanka, united by a love for all things digital. With a keen eye for detail and a commitment to excellence, we collaborate closely with our clients to understand their unique needs and deliver tailor-made solutions. From startups to established businesses, we help our partners navigate the digital landscape and make a lasting impression.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">What We Do</h2>
            <p>
              We specialize in a range of creative services designed to elevate your brand's presence. Our core offerings include:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 pl-4">
              {SERVICES.map(service => (
                <li key={service.title}>
                  <span className="font-semibold text-text-primary">{service.title}:</span> {service.description}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">Our Commitment</h2>
            <p>
              Customer satisfaction is at the heart of everything we do. We are committed to transparency, timely delivery, and open communication throughout the entire project lifecycle. We're not just a service provider; we're your creative partner, invested in your success. Let's build something amazing together.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AboutView;
