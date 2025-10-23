import React from 'react';
// FIX: Switched to a named import for Timestamp to fix module resolution errors with Firebase v9.
import { Timestamp } from 'firebase/firestore';

export interface Service {
  title: string;
  description: string;
  // FIX: Use React.ReactElement to explicitly specify the type and avoid issues with the JSX namespace.
  // FIX: Narrowing the type of icon to include SVGProps to fix cloneElement error.
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
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
