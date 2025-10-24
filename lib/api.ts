import { Order, PortfolioItem, Offer } from '../types';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    if (response.status === 204) return null; // No Content
    return response.json();
}

// Generic function to list data (orders, portfolio, offers)
export async function listData<T>(type: 'orders' | 'portfolio' | 'offers'): Promise<T[]> {
    const response = await fetch(`/api/data/${type}`);
    return handleResponse(response);
}

// Generic function to create data
export async function createData<T>(type: 'orders' | 'portfolio' | 'offers', data: Partial<T>): Promise<T> {
    const response = await fetch(`/api/data/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

// Generic function to update data
export async function updateData<T extends { url: string }>(data: T): Promise<T> {
    const response = await fetch(`/api/data/update?url=${encodeURIComponent(data.url)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}


// Generic function to delete data using its blob URL
export async function deleteData(url: string): Promise<void> {
    const response = await fetch(`/api/data/delete?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
    });
    await handleResponse(response);
}

// Function to upload a file
export async function uploadFile(file: File, path: string): Promise<{ url: string }> {
    const filename = `${path}/${Date.now()}_${file.name}`;
    const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
        body: file,
    });
    return handleResponse(response);
}

// Specific functions for type safety
export const addOrder = (data: Omit<Order, 'id' | 'status' | 'createdAt' | 'url'>) => createData<Order>('orders', data);
export const getOrders = () => listData<Order>('orders');

export const getPortfolioItems = () => listData<PortfolioItem>('portfolio');
export const addPortfolioItem = (data: Omit<PortfolioItem, 'id' | 'url'>) => createData<PortfolioItem>('portfolio', data);

export const getOffers = () => listData<Offer>('offers');
export const addOffer = (data: Omit<Offer, 'id' | 'url'>) => createData<Offer>('offers', data);
