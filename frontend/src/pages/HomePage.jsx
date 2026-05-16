import { useState, useEffect } from 'react';
import axios from 'axios';
import { Phone, MessageCircle, Calendar, Star, MapPin, Search } from 'lucide-react';

// Haversine formula to calculate distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;  // deg2rad below
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

export default function HomePage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  
  // Booking Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    customerPhone: '',
    quantity: 1,
    pickupTime: 'Morning'
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Rating Modal State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const sellerRes = await axios.get('http://localhost:8080/api/seller/all');
      const availRes = await axios.get('http://localhost:8080/api/availability/all-today');
      
      const merged = sellerRes.data.map(seller => {
        const availability = availRes.data.find(a => a.seller.id === seller.id);
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

  const handleBookClick = (seller) => {
    setSelectedSeller(seller);
    setShowModal(true);
    setBookingSuccess(false);
  };

  const handleRateClick = (seller) => {
    setSelectedSeller(seller);
    setRatingValue(5);
    setShowRatingModal(true);
    setRatingSuccess(false);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/bookings/create', {
        sellerId: selectedSeller.id,
        ...bookingForm
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setBookingSuccess(false);
        setBookingForm({ customerName: '', customerPhone: '', quantity: 1, pickupTime: 'Morning' });
      }, 2000);
    } catch (err) {
      console.error("Failed to create booking", err);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8080/api/seller/${selectedSeller.id}/rate`, {
        rating: ratingValue
      });
      setRatingSuccess(true);
      setTimeout(() => {
        setShowRatingModal(false);
        setRatingSuccess(false);
        fetchSellers(); // Refresh data
      }, 2000);
    } catch (err) {
      console.error("Failed to submit rating", err);
    }
  };

  const handleFindNearby = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
        setSortByDistance(true);
      }, (error) => {
        alert("Please enable location services to find nearby sellers.");
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading fresh toddy availability...</div>;
  }

  // Filter and sort sellers
  let displayedSellers = sellers.filter(s => 
    s.village?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (sortByDistance && userLocation) {
    displayedSellers = displayedSellers.map(s => {
      const distance = calculateDistance(userLocation.lat, userLocation.lon, s.latitude, s.longitude);
      return { ...s, distance };
    }).sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-8 text-gray-800 text-center tracking-tight">Fresh Toddy Near You</h2>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search by Village or Seller Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition shadow-sm"
          />
        </div>
        <button 
          onClick={handleFindNearby}
          className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium transition shadow-sm ${sortByDistance ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
        >
          <MapPin className="h-5 w-5 mr-2" /> 
          Find Nearby
        </button>
      </div>
      
      {displayedSellers.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">No sellers found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedSellers.map((seller) => (
            <div key={seller.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{seller.name}</h3>
                    <p className="text-gray-500 flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" /> {seller.village}
                      {seller.distance !== undefined && seller.distance !== null && (
                        <span className="ml-2 text-primary font-medium text-sm bg-primary/10 px-2 py-0.5 rounded-full">
                          {seller.distance.toFixed(1)} km away
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm">
                      Stock: {seller.availability.stockCount} L
                    </div>
                    <div className="mt-2 flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded-lg" onClick={() => handleRateClick(seller)}>
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-medium text-gray-700 text-sm">{seller.rating ? seller.rating.toFixed(1) : 'New'}</span>
                      <span className="text-gray-400 text-xs ml-1">({seller.ratingCount || 0})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Morning Slot:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${seller.availability.morningAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {seller.availability.morningAvailable ? '✅ Available' : '❌ Sold Out'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Evening Slot:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${seller.availability.eveningAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {seller.availability.eveningAvailable ? '✅ Available' : '❌ Sold Out'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button onClick={() => handleBookClick(seller)} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center transition shadow-md shadow-primary/20">
                    <Calendar className="w-5 h-5 mr-2" /> Book Fresh Toddy
                  </button>
                  <div className="flex gap-3">
                    <a href={`tel:${seller.phone}`} className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center transition">
                      <Phone className="w-4 h-4 mr-2" /> Call
                    </a>
                    <a href={`https://wa.me/91${seller.phone}?text=Hi%20${seller.name},%20I%20want%20to%20order%20toddy`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center transition shadow-md shadow-[#25D366]/20">
                      <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Book from {selectedSeller?.name}</h3>
            
            {bookingSuccess ? (
              <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center font-bold flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                Booking Confirmed Successfully!
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                  <input type="text" required value={bookingForm.customerName} onChange={e => setBookingForm({...bookingForm, customerName: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-0 focus:border-primary transition outline-none" placeholder="E.g. Ramesh" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                  <input type="tel" required value={bookingForm.customerPhone} onChange={e => setBookingForm({...bookingForm, customerPhone: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-0 focus:border-primary transition outline-none" placeholder="10-digit number" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity (Liters)</label>
                    <input type="number" min="1" max="10" required value={bookingForm.quantity} onChange={e => setBookingForm({...bookingForm, quantity: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-0 focus:border-primary transition outline-none text-center" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pickup Time</label>
                    <select value={bookingForm.pickupTime} onChange={e => setBookingForm({...bookingForm, pickupTime: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-0 focus:border-primary transition outline-none bg-white">
                      <option value="Morning">Morning</option>
                      <option value="Evening">Evening</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                  <button type="submit" className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition shadow-lg shadow-primary/30">Confirm</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 transform transition-all text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Rate {selectedSeller?.name}</h3>
            <p className="text-gray-500 mb-6 text-sm">How was the quality of the toddy?</p>
            
            {ratingSuccess ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold">
                Thanks for your rating!
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit}>
                <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setRatingValue(star)}
                      className="focus:outline-none transform transition hover:scale-110"
                    >
                      <Star className={`w-10 h-10 ${star <= ratingValue ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowRatingModal(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition">Cancel</button>
                  <button type="submit" className="flex-1 bg-yellow-400 text-yellow-900 font-bold py-3 rounded-xl hover:bg-yellow-500 transition shadow-lg shadow-yellow-400/30">Submit</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
