import React, { useState, useRef } from 'react';
import { SERVICES } from '../constants';
import { addOrder, getOrderStatus } from '../services/firebase';
import { Service, Order } from '../types';
import Chatbot from '../components/Chatbot';
import WhatsAppButton from '../components/WhatsAppButton';
import Footer from '../components/Footer';

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => (
  <div className="glass-card p-6 text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300">
    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent bg-opacity-20 mb-4">
      {React.cloneElement(service.icon, { className: "h-8 w-8 text-accent" })}
    </div>
    <h3 className="text-xl font-bold text-text-primary mb-2">{service.title}</h3>
    <p className="text-text-secondary flex-grow">{service.description}</p>
  </div>
);

const OrderForm: React.FC<{
  formData: { customerName: string; contactNumber: string; email: string; details: string; };
  setFormData: React.Dispatch<React.SetStateAction<{ customerName: string; contactNumber: string; email: string; details: string; }>>;
  orderFormRef: React.RefObject<HTMLDivElement>;
}> = ({ formData, setFormData, orderFormRef }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const inputStyles = "w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400";
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const orderId = await addOrder(formData);
      setMessage(`Your order has been placed successfully! Your Order ID is: ${orderId}`);
      setFormData({ customerName: '', contactNumber: '', email: '', details: '' });
    } catch (error) {
      setMessage("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={orderFormRef} className="glass-card p-8">
      <h2 className="text-3xl font-bold text-text-primary mb-6 text-center">Place an Order</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="Your Name" required className={inputStyles} />
          <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="Contact Number" required className={inputStyles} />
        </div>
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required className={inputStyles} />
        <textarea name="details" value={formData.details} onChange={handleChange} placeholder="Order Details (e.g., I need a logo for...)" rows={4} required className={inputStyles} />
        <button type="submit" disabled={loading} className="w-full bg-accent text-primary-bg py-3 px-6 rounded-xl font-semibold hover:bg-opacity-90 transition-all glowing-btn disabled:bg-gray-500 disabled:shadow-none">
          {loading ? 'Placing Order...' : 'Submit Order'}
        </button>
      </form>
      {message && <p className={`mt-4 text-center text-sm font-medium p-3 rounded-md ${message.includes('success') ? 'bg-accent bg-opacity-20 text-accent' : 'bg-error bg-opacity-20 text-error'}`}>{message}</p>}
    </div>
  );
};


const OrderStatusChecker: React.FC = () => {
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const inputStyles = "flex-grow p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400";

    const handleCheckStatus = async () => {
        if (!orderId.trim()) return;
        setLoading(true);
        setMessage('');
        setOrder(null);
        try {
            const result = await getOrderStatus(orderId.trim());
            if (result) {
                setOrder(result);
            } else {
                setMessage('Order not found. Please check your Order ID.');
            }
        } catch (error) {
            setMessage('An error occurred while fetching your order status.');
        } finally {
            setLoading(false);
        }
    };

    const statusStyles: { [key in Order['status']]: string } = {
      Pending: 'bg-amber bg-opacity-20 text-amber',
      'In Progress': 'bg-blue bg-opacity-20 text-blue',
      Completed: 'bg-accent bg-opacity-20 text-accent',
      Cancelled: 'bg-error bg-opacity-20 text-error',
    };

    return (
        <div className="glass-card p-8">
            <h2 className="text-3xl font-bold text-text-primary mb-6 text-center">Check Order Status</h2>
            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter Your Order ID"
                    className={inputStyles}
                />
                <button
                    onClick={handleCheckStatus}
                    disabled={loading}
                    className="bg-text-secondary bg-opacity-50 text-white py-3 px-6 rounded-xl font-semibold hover:bg-opacity-70 transition-colors disabled:bg-gray-600"
                >
                    {loading ? 'Checking...' : 'Check Status'}
                </button>
            </div>
            {message && <p className="mt-4 text-center text-sm font-medium text-error">{message}</p>}
            {order && (
                <div className="mt-6 p-4 border border-white border-opacity-20 rounded-lg space-y-2">
                    <p><strong>Order ID:</strong> {order.id}</p>
                    <p><strong>Customer:</strong> {order.customerName}</p>
                    <p><strong>Status:</strong> <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[order.status]}`}>{order.status}</span></p>
                </div>
            )}
        </div>
    );
};


const CustomerView: React.FC = () => {
    const [formData, setFormData] = useState({ customerName: '', contactNumber: '', email: '', details: '' });
    const orderFormRef = useRef<HTMLDivElement>(null);

    const handleOrderInfoExtracted = (info: typeof formData) => {
        setFormData(info);
        orderFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleScrollToOrder = () => {
        orderFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

  return (
    <div className="min-h-screen">
      <main>
        {/* Hero Section */}
        <section className="min-h-[60vh] flex items-center justify-center text-center py-20 relative overflow-hidden">
             <div className="absolute inset-0 bg-primary-bg opacity-50"></div>
             <div className="absolute top-0 left-0 w-72 h-72 bg-accent rounded-full filter blur-3xl opacity-20 animate-blob"></div>
             <div className="absolute top-0 right-0 w-72 h-72 bg-blue rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
             <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-error rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
             <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-text-primary">Create. Design. Innovate.</h1>
                <p className="mt-4 text-lg md:text-xl text-text-secondary max-w-3xl mx-auto">With Hi Drawpix — Your Creative Partner.</p>
                <div className="mt-8 flex justify-center gap-4">
                    <button onClick={handleScrollToOrder} className="bg-accent text-primary-bg py-3 px-8 rounded-xl font-semibold hover:bg-opacity-90 transition-all glowing-btn">
                        Order Now
                    </button>
                </div>
             </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-text-primary mb-12">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {SERVICES.map((service, index) => (
                <ServiceCard key={index} service={service} />
              ))}
            </div>
          </div>
        </section>

        {/* Order & Status Section */}
        <section id="order" className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <OrderForm formData={formData} setFormData={setFormData} orderFormRef={orderFormRef} />
              <OrderStatusChecker />
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <Chatbot onOrderInfoExtracted={handleOrderInfoExtracted}/>
    </div>
  );
};

export default CustomerView;
