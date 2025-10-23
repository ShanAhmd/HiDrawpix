import React from 'react';
import { Timestamp } from 'firebase/firestore';

export interface Service {
  title: string;
  description: string;
  // FIX: Use React.ReactElement to explicitly specify the type and avoid issues with the JSX namespace.
  icon: React.ReactElement;
}

export type OrderStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  contactNumber: string;
  email: string;
  details: string;
  status: OrderStatus;
  createdAt: Timestamp;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}
