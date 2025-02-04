import React from 'react';
import { Link } from 'react-router-dom';
import { Microscope } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-[#161B22] border-b border-[#30363D]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Microscope className="h-6 w-6 text-emerald-500" />
            <span className="text-xl font-bold">VerifyInfluencers</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link to="/leaderboard" className="hover:text-emerald-500">Leaderboard</Link>
            <Link to="/" className="hover:text-emerald-500">Products</Link>
            <Link to="/" className="hover:text-emerald-500">Monetization</Link>
            <Link to="/" className="hover:text-emerald-500">About</Link>
            <Link to="/" className="hover:text-emerald-500">Contact</Link>
            <Link to="/" className="hover:text-emerald-500">Admin</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;