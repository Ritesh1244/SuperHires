import React, { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Package, Users, Search, Filter, SlidersHorizontal } from "lucide-react";

const InfluencerProfile = () => {
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Claims Analysis");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All Categories",
    "Sleep",
    "Performance",
    "Hormones",
    "Nutrition",
    "Exercise",
    "Stress",
    "Cognition",
    "Motivation",
    "Recovery",
    "Mental Health"
  ];

  const verificationStatuses = ["All Statuses", "Verified", "Questionable", "Debunked"];

  useEffect(() => {
    const fetchInfluencer = async () => {
      try {
        const response = await fetch("http://localhost:9000/api/influencerDetails/BethFratesMD");
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setInfluencer(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInfluencer();
  }, []);

  if (loading) return <div className="text-center text-gray-400">Loading...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;
  if (!influencer) return <div className="text-center text-gray-400">No data available</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[#0D1117] min-h-screen text-gray-100">
      {/* Profile Header */}
      <div className="flex items-start space-x-6 mb-8">
        <img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          alt="Profile"
          className="w-24 h-24 rounded-full"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{influencer.name}</h1>
          <p className="text-gray-400">{influencer.bio}</p>
          <div className="flex gap-4 mt-4">
            {["Neuroscience", "Sleep", "Performance", "Hormones", "Stress Management"].map((tag) => (
              <span key={tag} className="text-sm text-gray-400">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#161B22] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-3xl font-bold text-emerald-500">{influencer.trustScore}</h3>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-sm text-gray-400">Trust Score</p>
          <p className="text-xs text-gray-500">Based on verified claims</p>
        </div>

        {/* <div className="bg-[#161B22] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-3xl font-bold text-emerald-500">{influencer.yearlyRevenue}</h3>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-sm text-gray-400">Yearly Revenue</p>
          <p className="text-xs text-gray-500">Estimated earnings</p>
        </div> */}

        <div className="bg-[#161B22] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-3xl font-bold text-emerald-500">{influencer.tweets}</h3>
            <Package className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-sm text-gray-400">Products</p>
          <p className="text-xs text-gray-500">Recommended products</p>
        </div>

        <div className="bg-[#161B22] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-3xl font-bold text-emerald-500">{influencer.followers}</h3>
            <Users className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-sm text-gray-400">Followers</p>
          <p className="text-xs text-gray-500">Total following</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 mb-6">
        <div className="flex space-x-8">
          {["Claims Analysis", "Recommended Products", "Monetization"].map((tab) => (
            <button
              key={tab}
              className={`pb-4 px-1 ${
                activeTab === tab
                  ? "border-b-2 border-emerald-500 text-emerald-500"
                  : "text-gray-400"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search claims..."
          className="w-full bg-[#161B22] rounded-lg pl-12 pr-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm ${
                category === "All Categories"
                  ? "bg-emerald-500 text-white"
                  : "bg-[#161B22] text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-500"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400 ">Verification Status</div>
          <div className="flex space-x-2">
            {verificationStatuses.map((status) => (
              <button
                key={status}
                className={`px-4 py-2 rounded-full text-sm ${
                  status === "All Statuses"
                    ? "bg-emerald-500 text-white"
                    : "bg-[#161B22] text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-500"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">Sort By</span>
          <select className="bg-[#161B22] text-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option>Date</option>
            <option>Trust Score</option>
          </select>
          <button className="p-2 rounded-lg bg-[#161B22] text-gray-400 hover:text-emerald-500">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Claims */}
      <div className="space-y-4">
        {influencer.claimAnalysis.claims.Uncategorized.map((claim, index) => (
          <div key={index} className="bg-[#161B22] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  claim.verificationStatus.includes("Questionable")
                    ? "bg-yellow-500/20 text-yellow-500"
                    : "bg-emerald-500/20 text-emerald-500"
                }`}>
                  {claim.verificationStatus}
                </span>
                <span className="text-gray-400 text-sm">{claim.date}</span>
              </div>
              <span className="text-emerald-500 font-bold">{claim.trustScore}</span>
            </div>
            <p className="text-gray-100 mb-4">{claim.text}</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Sources:</span>
              {claim.sources.map((source, idx) => (
                <span key={idx} className="text-sm text-emerald-500">
                  {source}{idx < claim.sources.length - 1 ? "," : ""}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfluencerProfile;