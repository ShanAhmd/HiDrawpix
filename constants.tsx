import React from 'react';
import { Service } from './types';

const DesignIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M12 4v16"/><path d="M7 20h10"/><path d="M3 4h10"/><path d="m17 4 4 4-4 4"/><path d="m3 12 4 4-4 4"/></svg>
);
const TypesettingIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10"/><path d="M12 4v16"/><path d="M15 4h1a2 2 0 0 1 2 2v2"/><path d="M8 20H7a2 2 0 0 1-2-2v-2"/></svg>
);
const VideoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
);
const WebDevIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
);

export const SERVICES: Service[] = [
  {
    title: 'Graphic Design',
    description: 'Creative logos, brochures, and social media posts that capture your brand\'s essence.',
    icon: <DesignIcon />,
    minPrice: 50,
  },
  {
    title: 'Typesetting',
    description: 'Professional document layout and formatting for books, reports, and publications.',
    icon: <TypesettingIcon />,
    minPrice: 30,
  },
  {
    title: 'Video Editing',
    description: 'Engaging video content for marketing, events, and personal projects with professional polish.',
    icon: <VideoIcon />,
    minPrice: 100,
  },
  {
    title: 'Web Development',
    description: 'Modern, responsive websites and web applications tailored to your business needs.',
    icon: <WebDevIcon />,
    minPrice: 300,
  },
];

export const CREATIONS_IMAGES = [
    'https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1064&q=80',
    'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1472&q=80',
    'https://images.unsplash.com/photo-1629788979883-d3434e455447?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
];

export const OFFERS = [
    {
        title: 'Startup Branding Package',
        description: 'Includes a custom logo, business card design, and social media branding kit. Perfect for new businesses.',
        price: '$250',
    },
    {
        title: 'Social Media Content Bundle',
        description: 'A month\'s worth of custom-designed social media posts (12 posts) to keep your audience engaged.',
        price: '$180',
    },
    {
        title: 'Basic Website Package',
        description: 'A professional, responsive, 3-page website to establish your online presence. Includes contact form.',
        price: '$499',
    },
];


export const WHATSAPP_LINK = "https://wa.me/94762896449";
export const MAP_LOCATION_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15820.702001552044!2d80.5732296!3d7.5439401!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae345170d182281%3A0x86c61f269389771e!2sMorathiha!5e0!3m2!1sen!2slk!4v1682823652824!5m2!1sen!2slk";

export const GEMINI_SYSTEM_INSTRUCTION = `You are a friendly and helpful assistant for "Hi Drawpix Online Order System". 
Your services include: Graphic Design, Typesetting, Video Editing, and Web Development.
You can answer questions about these services.
You can also help users place an order. To place an order, you MUST collect their name, contact number, email, selected service, and order details.
Once you have all the details, you MUST format the information as a JSON object and respond ONLY with that JSON object inside a code block.
Example of a final response for an order:
\`\`\`json
{
  "customerName": "John Doe",
  "contactNumber": "123-456-7890",
  "email": "john.doe@example.com",
  "service": "Graphic Design",
  "details": "I need a logo for my new coffee shop."
}
\`\`\`
Do not add any other text outside the JSON code block when providing the final order details. Be conversational and helpful until you have all the information.`;
