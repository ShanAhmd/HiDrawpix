import React, { useState } from 'react';
import { addOrder } from '../services/firebase';
import { Order } from '../types';
import { SERVICES } from '../constants';
import AdminModal from './AdminModal';

interface NewOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        contactNumber: '',
        email: '',
        details: '',
        service: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const inputStyles = "w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        // Reset form on close
        setFormData({ customerName: '', contactNumber: '', email: '', details: '', service: '' });
        setError('');
        setMessage('');
        setLoading(false);
        onClose();
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.service) {
            setError("Please select a service.");
            return;
        }
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const newOrderId = await addOrder(formData as Omit<Order, 'id' | 'status' | 'createdAt'>);
            setMessage(`Order created successfully with ID: ${newOrderId}`);
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err) {
            setError('Failed to create order. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <AdminModal title="Create New Order" isOpen={isOpen} onClose={handleClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="Customer Name" required className={inputStyles} />
                    <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="Contact Number" required className={inputStyles} />
                </div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required className={inputStyles} />
                <select name="service" value={formData.service} onChange={handleChange} required className={`${inputStyles} appearance-none`}>
                    <option value="" disabled>Select a service...</option>
                    {SERVICES.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
                </select>
                <textarea name="details" value={formData.details} onChange={handleChange} placeholder="Order Details" rows={3} required className={inputStyles} />
                {error && <p className="text-sm text-center text-error p-2 bg-error bg-opacity-20 rounded-md">{error}</p>}
                {message && <p className="text-sm text-center text-accent p-2 bg-accent bg-opacity-20 rounded-md">{message}</p>}
                <div className="flex justify-end gap-4 pt-2">
                    <button type="button" onClick={handleClose} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700">Cancel</button>
                    <button type="submit" disabled={loading} className="py-2 px-4 rounded-lg bg-accent text-primary-bg hover:bg-opacity-90 disabled:bg-gray-500">{loading ? 'Creating...' : 'Create Order'}</button>
                </div>
            </form>
        </AdminModal>
    );
};

export default NewOrderModal;
