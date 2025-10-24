import '../styles/globals.css';
import type { AppProps } from 'next/app';
import React, { useEffect } from 'react';

// Declare the emailjs library which is loaded from a script tag in _document.tsx
declare const emailjs: any;

function MyApp({ Component, pageProps }: AppProps) {
    useEffect(() => {
    // Initialize EmailJS with the public key when the app loads.
    if (typeof emailjs !== 'undefined') {
        try {
            emailjs.init({ publicKey: 'R5xvS0Q7ecbwMgjZB' });
        } catch(e) {
            console.error('EmailJS init failed:', e)
        }
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
