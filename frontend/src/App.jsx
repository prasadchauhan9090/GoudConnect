import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SellerLogin from './pages/SellerLogin';
import SellerDashboard from './pages/SellerDashboard';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">GoudConnect</h1>
          <nav>
            <a href="/login" className="text-white hover:text-green-100 font-medium">Seller Login</a>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<SellerLogin />} />
          <Route path="/dashboard" element={<SellerDashboard />} />
        </Routes>
      </main>

      <footer className="bg-gray-800 text-gray-300 text-center p-4 text-sm">
        &copy; {new Date().getFullYear()} GoudConnect. Connecting local sellers with customers.
      </footer>
    </div>
  );
}

export default App;
