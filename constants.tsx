import React from 'react';
import { Service } from './types';

// SVG Icons as React Components
const LogoDesignIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
);

const WebDesignIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
);

const TypesettingIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
);

const VideoEditingIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

export const SERVICES: Service[] = [
  {
    title: 'Logo & Brand Identity',
    description: 'Crafting unique logos and comprehensive brand guidelines to make your business stand out.',
    icon: <LogoDesignIcon />,
    minPrice: 99,
  },
  {
    title: 'Website Design',
    description: 'Designing responsive, user-friendly websites that look great on any device.',
    icon: <WebDesignIcon />,
    minPrice: 299,
  },
  {
    title: 'Typesetting',
    description: 'Professional typesetting for documents, books, and reports, ensuring a clean and readable layout.',
    icon: <TypesettingIcon />,
    minPrice: 49,
  },
  {
    title: 'Video Editing',
    description: 'Professional video editing for promotional content, social media, and more.',
    icon: <VideoEditingIcon />,
    minPrice: 79,
  },
];

export const WHATSAPP_LINK = 'https://wa.me/94762896449';

export const MAP_LOCATION_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.1278183187893!2d80.59018131526485!3d7.561081994546083!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae345479261a257%3A0x62955856233e7e4!2sMorathiha!5e0!3m2!1sen!2slk!4v1620000000000';

export const GEMINI_SYSTEM_INSTRUCTION = `You are a friendly and professional customer service assistant for "Hi Drawpix," a creative design agency. Your primary goal is to help users place orders by collecting necessary information and answering their questions about services.

Our services include: ${SERVICES.map(s => s.title).join(', ')}.

When a user wants to place an order, you MUST collect the following details and then format them into a JSON object inside a \`\`\`json code block:
- customerName: The user's full name.
- contactNumber: The user's phone number.
- email: The user's email address.
- service: The specific service they are interested in. It must be one of the available services.
- details: A detailed description of their requirements.

Example Interaction:
User: "I need a logo for my new coffee shop."
You: "That sounds exciting! I can help with that. Could I get your full name, phone number, and email address to start the order?"
User: "Sure, it's John Doe, 555-1234, john.doe@email.com. I want the logo to be modern and minimalist."
You: "Perfect. I have your details. Here is the summary in JSON format. I will now populate the order form on the website for you to review."
\`\`\`json
{
  "customerName": "John Doe",
  "contactNumber": "555-1234",
  "email": "john.doe@email.com",
  "service": "Logo & Brand Identity",
  "details": "I want a modern and minimalist logo for my new coffee shop."
}
\`\`\`

- Be conversational and helpful.
- If the user asks about prices, refer to the minimum prices: Logo & Brand Identity (starts from $99), Website Design (starts from $299), Typesetting (starts from $49), Video Editing (starts from $79).
- Do not make up services or prices.
- Always guide the user to fill out the order form if they haven't provided all the details.
- Only output the JSON object when you have all the required information.
`;