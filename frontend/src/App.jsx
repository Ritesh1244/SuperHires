import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminPanel from './pages/AdminPanel';
import Leaderboard from './pages/Leaderboard';
import InfluencerProfile from './pages/InfluencerProfile';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0D1117] text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<AdminPanel />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/influencer/:handle" element={<InfluencerProfile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;