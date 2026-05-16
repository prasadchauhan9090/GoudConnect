import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SellerDashboard() {
  const [seller, setSeller] = useState(null);
  const [availability, setAvailability] = useState({
    morningAvailable: false,
    eveningAvailable: false,
    stockCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const sellerData = localStorage.getItem('seller');
    if (!sellerData) {
      navigate('/login');
      return;
    }
    
    const parsedSeller = JSON.parse(sellerData);
    setSeller(parsedSeller);

    const fetchAvailability = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/availability/today/${parsedSeller.id}`);
        if (res.data) {
          setAvailability({
            morningAvailable: res.data.morningAvailable,
            eveningAvailable: res.data.eveningAvailable,
            stockCount: res.data.stockCount
          });
        }
      } catch (err) {
        console.error("Failed to load availability", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [navigate]);

  const handleToggle = (field) => {
    setAvailability({ ...availability, [field]: !availability[field] });
  };

  const handleStockChange = (e) => {
    setAvailability({ ...availability, stockCount: parseInt(e.target.value) || 0 });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await axios.post('http://localhost:8080/api/availability/update', {
        sellerId: seller.id,
        ...availability
      });
      setMessage('Availability updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update availability.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('seller');
    navigate('/');
  };

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {seller?.name}</h2>
        <button onClick={handleLogout} className="text-sm bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded">Logout</button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Today's Stock & Availability</h3>
        
        {message && (
          <div className={`p-3 rounded mb-4 text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-gray-700">Morning Slot</span>
              <p className="text-xs text-gray-500">6:00 AM - 10:00 AM</p>
            </div>
            <button 
              onClick={() => handleToggle('morningAvailable')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${availability.morningAvailable ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${availability.morningAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-gray-700">Evening Slot</span>
              <p className="text-xs text-gray-500">4:00 PM - 8:00 PM</p>
            </div>
            <button 
              onClick={() => handleToggle('eveningAvailable')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${availability.eveningAvailable ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${availability.eveningAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block font-medium text-gray-700 mb-2">Estimated Stock (Liters)</label>
            <input 
              type="number" 
              min="0"
              value={availability.stockCount}
              onChange={handleStockChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            {saving ? 'Saving...' : 'Save Updates'}
          </button>
        </div>
      </div>
    </div>
  );
}
