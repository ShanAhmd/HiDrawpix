
import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword } from '../services/firebase';

interface AdminSignInProps {
  onSwitchToSignUp: () => void;
}

const AdminSignIn: React.FC<AdminSignInProps> = ({ onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputStyles = "w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-112px)] px-4">
      <div className="w-full max-w-md p-8 space-y-6 glass-card">
        <h2 className="text-3xl font-bold text-center text-text-primary">Admin Sign In</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
            <input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="admin@example.com" 
              required 
              className={inputStyles} 
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">Password</label>
            <input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
              className={inputStyles}
            />
          </div>
          {error && <p className="text-sm text-center text-error p-3 bg-error bg-opacity-20 rounded-md">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-accent text-primary-bg py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all glowing-btn disabled:bg-gray-500 disabled:shadow-none">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="text-center mt-4">
            <p className="text-sm text-text-secondary">
                Don't have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToSignUp}
                    className="font-semibold text-accent hover:underline focus:outline-none bg-transparent border-none"
                >
                    Sign Up
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignIn;
