import React from 'react';
// FIX: Changed import path from 'firebase/firestore' to '@firebase/firestore' to resolve module export errors.
import { Timestamp } from '@firebase/firestore';

export interface Service {
  title: string;
  description: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  minPrice?: number;
}

export type OrderStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  contactNumber: string;
  email: string;
  details: string;
  service: string;
  status: OrderStatus;
  createdAt: Timestamp;
  fileURL?: string;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageURL: string;
  status: 'Show' | 'Hide';
  createdAt: Timestamp;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  price: string;
  status: 'Active' | 'Inactive';
  createdAt: Timestamp;
}