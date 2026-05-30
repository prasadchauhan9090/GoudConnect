import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SellerDashboard() {
  const [seller, setSeller] = useState(null);
  const [availability, setAvailability] = useState({ morningAvailable: false, eveningAvailable: false, stockCount: 0 });
  const [bookings, setBookings] = useState([]);
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

    const fetchData = async () => {
      try {
        const availRes = await axios.get(`/api/availability/today/${parsedSeller.id}`);
        if (availRes.data) {
          setAvailability({
            morningAvailable: availRes.data.morningAvailable,
            eveningAvailable: availRes.data.eveningAvailable,
            stockCount: availRes.data.stockCount
          });
        }

        const bookingsRes = await axios.get(`/api/bookings/seller/${parsedSeller.id}`);
        setBookings(bookingsRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      await axios.post('/api/availability/update', {
        sellerId: seller.id,
        ...availability
      });
      setMessage('Availability updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      if (err.response && err.response.data && typeof err.response.data === 'object' && !err.response.data.message) {
         const errorMsgs = Object.values(err.response.data).join(', ');
         setMessage(`Validation error: ${errorMsgs}`);
      } else if (err.response && err.response.data && err.response.data.message) {
         setMessage(err.response.data.message);
      } else {
         setMessage('Failed to update availability.');
      }
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
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Availability Section */}
      <div>
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

      {/* Bookings Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Bookings</h2>
        <div className="bg-white rounded-xl shadow-md p-6">
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="border border-gray-100 bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800">{booking.customerName}</h4>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                      {booking.pickupTime}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>📱 {booking.customerPhone}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{booking.quantity} Liters</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">₹{booking.quantity * 100}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
