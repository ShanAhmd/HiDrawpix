import React from 'react';

export interface Service {
  title: string;
  description: string;
  icon: React.ReactElement;
  minPrice: number;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export type OrderStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  contactNumber: string;
  email: string;
  service: string;
  details: string;
  fileURL?: string;
  status: OrderStatus;
  createdAt: string; // ISO Date String
  deliveryFileURL?: string;
  price?: string;
  url: string; // URL of the blob in Vercel Storage
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageURL: string;
  status: 'Show' | 'Hide';
  url: string; // URL of the blob in Vercel Storage
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  price: string;
  status: 'Active' | 'Inactive';
  url: string; // URL of the blob in Vercel Storage
}
