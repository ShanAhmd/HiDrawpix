import React, { useState, useRef, useMemo } from 'react';
import { SERVICES, CREATIONS_IMAGES, OFFERS } from '../constants';
import { addOrder, getOrderStatus, uploadFile } from '../services/firebase';
import { Service, Order } from '../types';
import Chatbot from '../components/Chatbot';
import WhatsAppButton from '../components/WhatsAppButton';
import Footer from '../components/Footer';

type FormData = {
  customerName: string;
  contactNumber: string;
  email: string;
  details: string;
  service: string;
};

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => (
  <div className="glass-card p-6 text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 h-full">
    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent bg-opacity-20 mb-4">
      {React.cloneElement(service.icon, { className: "h-8 w-8 text-accent" })}
    </div>
    <h3 className="text-xl font-bold text-text-primary mb-2">{service.title}</h3>
    <p className="text-text-secondary flex-grow">{service.description}</p>
  </div>
);

const OrderForm: React.FC<{
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  orderFormRef: React.RefObject<HTMLDivElement>;
}> = ({ formData, setFormData, orderFormRef }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const inputStyles = "w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400";

  const selectedService = useMemo(() => {
    return SERVICES.find(s => s.title === formData.service);
  }, [formData.service]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setSelectedFile(file);
    } else {
      setFileName('');
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service) {
      setMessage("Please select a service.");
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      let fileURL: string | undefined = undefined;
      if (selectedFile) {
        // Upload the file and get the URL
        fileURL = await uploadFile(selectedFile);
      }
      
      const orderData = { ...formData, fileURL };
      const orderId = await addOrder(orderData);
      
      setMessage(`Your order has been placed successfully! Your Order ID is: ${orderId}`);
      setFormData({ customerName: '', contactNumber: '', email: '', details: '', service: '' });
      setFileName('');
      setSelectedFile(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to place order. Please try again.";
      setMessage(errorMessage);
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
        
        <div className="relative">
          <select name="service" value={formData.service} onChange={handleChange} required className={`${inputStyles} appearance-none`}>
            <option value="" disabled>Select a service...</option>
            {SERVICES.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
        
        {selectedService?.minPrice && (
            <p className="text-sm text-center text-accent -mt-2">Starts from ${selectedService.minPrice}</p>
        )}
        
        <textarea name="details" value={formData.details} onChange={handleChange} placeholder="Order Details (e.g., I need a logo for...)" rows={4} required className={inputStyles} />

        <div>
            <label htmlFor="file-upload" className={`${inputStyles} cursor-pointer flex items-center justify-between`}>
                <span className={fileName ? 'text-white' : 'text-gray-400'}>{fileName || 'Attach a file (optional)'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
            </label>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
        </div>

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
                    <p><strong>Service:</strong> {order.service}</p>
                    <p><strong>Status:</strong> <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[order.status]}`}>{order.status}</span></p>
                </div>
            )}
        </div>
    );
};


const CustomerView: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({ customerName: '', contactNumber: '', email: '', details: '', service: '' });
    const orderFormRef = useRef<HTMLDivElement>(null);

    const handleOrderInfoExtracted = (info: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...info }));
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

        {/* Our Creations Section */}
        <section id="creations" className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-text-primary mb-12">Our Creations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {CREATIONS_IMAGES.map((src, index) => (
                        <div key={index} className="glass-card p-2 group overflow-hidden">
                            <img src={src} alt={`Creation ${index + 1}`} className="w-full h-full object-cover rounded-lg transform group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Special Offers Section */}
        <section id="offers" className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-text-primary mb-12">Special Offers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {OFFERS.map((offer, index) => (
                        <div key={index} className="glass-card p-6 flex flex-col text-center">
                            <h3 className="text-xl font-bold text-accent mb-2">{offer.title}</h3>
                            <p className="text-text-secondary flex-grow mb-4">{offer.description}</p>
                            <div className="text-3xl font-bold text-white mb-4">{offer.price}</div>
                            <button onClick={handleScrollToOrder} className="mt-auto bg-accent bg-opacity-20 text-accent py-2 px-6 rounded-xl font-semibold hover:bg-opacity-40 transition-all">
                                Order Now
                            </button>
                        </div>
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
