import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SellerLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    village: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await axios.post('/api/seller/login', {
          phone: formData.phone,
          password: formData.password
        });
        localStorage.setItem('seller', JSON.stringify(res.data));
        navigate('/dashboard');
      } else {
        const res = await axios.post('/api/seller/register', formData);
        localStorage.setItem('seller', JSON.stringify(res.data));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {isLogin ? 'Seller Login' : 'Register as Seller'}
      </h2>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" name="name" required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
              <input type="text" name="village" required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none" onChange={handleChange} />
            </div>
          </>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input type="tel" name="phone" required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none" onChange={handleChange} />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" name="password" required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none" onChange={handleChange} />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition duration-200">
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline">
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}
