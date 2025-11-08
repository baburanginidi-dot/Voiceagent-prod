
import React, { useState } from 'react';

interface AuthScreenProps {
  onLogin: (name: string, phone: string) => Promise<void>;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.trim().length < 10) return;
    setLoading(true);
    setError(null);
    try {
      await onLogin(name.trim(), phone.trim());
    } catch (err) {
      console.error(err);
      setError('Unable to start the session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#EAF4FF] to-[#F9FBFF] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,88,255,0.15)] p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#0A1A3F] font-poppins">Welcome to Maya</h1>
          <p className="mt-2 text-[#475569]">Your AI Onboarding Assistant</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#0A1A3F]">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0058FF] transition"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#0A1A3F]">Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              minLength={10}
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0058FF] transition"
              placeholder="Enter your phone number"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0058FF] text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0058FF] transition-transform transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? 'Connecting…' : 'Start Onboarding'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;
