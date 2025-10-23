
import React, { useState } from 'react';
import { auth, createUserWithEmailAndPassword } from '../services/firebase';

interface AdminSignUpProps {
  onSwitchToSignIn: () => void;
}

const AdminSignUp: React.FC<AdminSignUpProps> = ({ onSwitchToSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputStyles = "w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400";

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // On successful signup, Firebase automatically signs the user in,
      // so the main App component will detect the user and switch to the dashboard.
    } catch (err) {
      if (err instanceof Error) {
          if (err.message.includes('weak-password')) {
            setError('Password should be at least 6 characters.');
          } else if (err.message.includes('email-already-in-use')) {
            setError('This email address is already in use.');
          } else {
            setError('An unknown error occurred. Please try again.');
          }
      } else {
          setError('Failed to create an account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-112px)] px-4">
      <div className="w-full max-w-md p-8 space-y-6 glass-card">
        <h2 className="text-3xl font-bold text-center text-text-primary">Create Admin Account</h2>
        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label htmlFor="email-signup" className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
            <input
              id="email-signup"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className={inputStyles}
            />
          </div>
          <div>
            <label htmlFor="password-signup" className="block text-sm font-medium text-text-secondary mb-2">Password</label>
            <input
              id="password-signup"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6+ characters"
              required
              className={inputStyles}
            />
          </div>
          {error && <p className="text-sm text-center text-error p-3 bg-error bg-opacity-20 rounded-md">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-accent text-primary-bg py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all glowing-btn disabled:bg-gray-500 disabled:shadow-none">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className="text-center mt-4">
            <p className="text-sm text-text-secondary">
                Already have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToSignIn}
                    className="font-semibold text-accent hover:underline focus:outline-none bg-transparent border-none"
                >
                    Sign In
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignUp;
