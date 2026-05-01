import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../../services/authService';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (email !== 'admin@mostlyindia.in') {
        throw new Error('This portal is restricted to the master administrator only.');
      }
      await authService.signInWithEmail(email, password);
      // Wait a moment for session to propagate
      const isConfirmed = await authService.isAdmin();
      if (isConfirmed) {
        navigate('/admin');
      } else {
        throw new Error('Authentication verified but administrative elevation failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Access Denied: Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-6 font-manrope">
      <div className="w-full max-w-md bg-[#20201f] rounded-[2.5rem] p-10 neumorphic-flat animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#0e0e0e] neumorphic-inset rounded-full flex items-center justify-center mx-auto mb-6">
             <span className="material-symbols-outlined text-[#FBDE06]" style={{ fontSize: '32px' }}>key</span>
          </div>
          <h1 className="font-archivo text-[#FBDE06] uppercase text-2xl tracking-tighter">THE ARCHIVE</h1>
          <p className="text-[#adaaaa] uppercase tracking-[0.2em] mt-2" style={{ fontSize: '10px' }}>Secure Administration Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#FBDE06] uppercase tracking-[0.3em] ml-1">Master Email</label>
            <input 
              type="email"
              required
              placeholder="admin@mostlyindia.in"
              className="w-full bg-[#131313] neumorphic-inset rounded-xl px-5 py-4 border-0 text-white outline-none focus:ring-1 focus:ring-[#FBDE06]/20 transition-all placeholder:text-gray-800"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#FBDE06] uppercase tracking-[0.3em] ml-1">Archive Key</label>
            <input 
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-[#131313] neumorphic-inset rounded-xl px-5 py-4 border-0 text-white outline-none focus:ring-1 focus:ring-[#FBDE06]/20 transition-all placeholder:text-gray-800"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-[#FBDE06] text-[#0e0e0e] font-black uppercase tracking-[0.3em] text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0px_10px_20px_rgba(251,222,6,0.2)] mt-4"
          >
            {loading ? 'Decrypting Access...' : 'Elevate to Admin'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in shake-in-from-left duration-300">
               <p className="text-red-500 text-center uppercase tracking-widest text-[9px] font-black">{error}</p>
            </div>
          )}
        </form>

        <div className="mt-8 text-center">
          <Link to="/" className="text-[10px] text-[#adaaaa] hover:text-white uppercase tracking-widest">Return to Home</Link>
        </div>
      </div>
    </div>
  );
}
