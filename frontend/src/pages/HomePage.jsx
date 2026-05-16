import { useState, useEffect } from 'react';
import axios from 'axios';
import { Phone, MessageCircle } from 'lucide-react';

export default function HomePage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        // Fetch all sellers
        const sellerRes = await axios.get('http://localhost:8080/api/seller/all');
        const sellersData = sellerRes.data;

        // Fetch today's availability
        const availRes = await axios.get('http://localhost:8080/api/availability/all-today');
        const availData = availRes.data;

        // Merge data
        const merged = sellersData.map(seller => {
          const availability = availData.find(a => a.seller.id === seller.id);
          return {
            ...seller,
            availability: availability || { morningAvailable: false, eveningAvailable: false, stockCount: 0 }
          };
        });

        setSellers(merged);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading fresh toddy availability...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Fresh Toddy Available Today</h2>
      
      {sellers.length === 0 ? (
        <p className="text-center text-gray-500">No sellers registered yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sellers.map((seller) => (
            <div key={seller.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition hover:shadow-lg">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{seller.name}</h3>
                    <p className="text-gray-500 text-sm">{seller.village}</p>
                  </div>
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    Stock: {seller.availability.stockCount} L
                  </div>
                </div>

                <div className="space-y-3 mb-6 bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Morning:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${seller.availability.morningAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {seller.availability.morningAvailable ? '✅ Available' : '❌ Not Available'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Evening:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${seller.availability.eveningAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {seller.availability.eveningAvailable ? '✅ Available' : '❌ Not Available'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a href={`tel:${seller.phone}`} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg flex items-center justify-center transition">
                    <Phone className="w-4 h-4 mr-2" /> Call
                  </a>
                  <a href={`https://wa.me/91${seller.phone}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition">
                    <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
