// FIX: Corrected import statement for React hooks.
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import AdminModal from './AdminModal';
import { uploadImage, setOrderAsCompleted } from '../services/firebase';

// Declare the emailjs library which is loaded from a script tag in index.html
declare const emailjs: any;

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const DeliveryModal: React.FC<DeliveryModalProps> = ({ isOpen, onClose, order }) => {
  const [file, setFile] = useState<File | null>(null);
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
        setFile(null);
        setPrice('');
        setFeedback(null);
        setLoading(false);
    }
  }, [isOpen, order]);

  const inputStyles = "w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400";

  const handleSend = async () => {
    if (!file) {
      setFeedback({ type: 'error', message: 'Please attach the final delivery file.' });
      return;
    }
     if (!price.trim()) {
        setFeedback({ type: 'error', message: 'Please enter the final price for the order.' });
        return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      // 1. Upload file to Firebase Storage
      const downloadURL = await uploadImage(file, 'delivery-files');
      
      // 2. Update order status in Firestore
      await setOrderAsCompleted(order.id, downloadURL, price);
      
      // 3. Send email using EmailJS
      // IMPORTANT: Replace these placeholders with your actual EmailJS credentials
      const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
      const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
      const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

      const templateParams = {
        to_name: order.customerName,
        to_email: order.email,
        from_name: 'Hi Drawpix Team',
        order_id: order.id,
        service: order.service,
        price: price,
        download_link: downloadURL,
        completion_date: new Date().toLocaleDateString(),
      };
      
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      
      setFeedback({ type: 'success', message: 'Email sent successfully! Closing...' });

      setTimeout(() => {
          onClose();
      }, 2000);

    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to complete delivery. Check console for details.' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal title="Complete & Deliver Order" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div>
            <h4 className="text-lg font-semibold text-text-primary">Receipt & Email Preview</h4>
            <div className="mt-2 p-4 bg-black bg-opacity-20 rounded-lg text-sm text-text-secondary space-y-1 border border-white border-opacity-10">
                <p><strong>To:</strong> {order.customerName} ({order.email})</p>
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Service:</strong> {order.service}</p>
                <p><strong>Final Price:</strong> {price || '(Enter price below)'}</p>
                <p><strong>Completed On:</strong> {new Date().toLocaleDateString()}</p>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Final Price</label>
            <input 
                type="text" 
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="e.g., $99.00"
                className={inputStyles} 
                required 
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Attach Final File</label>
            <input 
                type="file" 
// FIX: Corrected typo from `e.g.files` to `e.target.files`.
                onChange={e => setFile(e.target.files ? e.target.files[0] : null)} 
                className={`${inputStyles} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-primary-bg hover:file:bg-opacity-90`} 
                required 
            />
        </div>

        {feedback && (
          <p className={`text-sm text-center p-2 rounded-md ${feedback.type === 'error' ? 'bg-error bg-opacity-20 text-error' : 'bg-accent bg-opacity-20 text-accent'}`}>
            {feedback.message}
          </p>
        )}
        
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700">Cancel</button>
          <button onClick={handleSend} disabled={loading || !file} className="py-2 px-4 rounded-lg bg-accent text-primary-bg hover:bg-opacity-90 disabled:bg-gray-500">{loading ? 'Processing...' : 'Send to Customer'}</button>
        </div>
      </div>
    </AdminModal>
  );
};

export default DeliveryModal;