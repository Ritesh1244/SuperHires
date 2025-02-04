import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, CheckCircle, TrendingUp } from "lucide-react";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("http://localhost:9000/api/leaderboard");
        if (!response.ok) throw new Error("Failed to fetch leaderboard data");
        const data = await response.json();
        setLeaderboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="text-center text-gray-400">Loading...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;
  if (!leaderboardData) return <div className="text-center text-gray-400">No leaderboard data available</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Influencer Trust Leaderboard</h1>
      <p className="text-gray-400 mb-8">
        Real-time rankings of health influencers based on scientific accuracy, credibility, and transparency. Updated daily using AI-powered analysis.
      </p>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-[#161B22] rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8 text-emerald-500" />
            <div>
              <h3 className="text-2xl font-bold">{leaderboardData.totalActiveInfluencers}</h3>
              <p className="text-sm text-gray-400">Active Influencers</p>
            </div>
          </div>
        </div>

        <div className="bg-[#161B22] rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <div>
              <h3 className="text-2xl font-bold">{leaderboardData.totalVerifiedClaims}</h3>
              <p className="text-sm text-gray-400">Claims Verified</p>
            </div>
          </div>
        </div>

        <div className="bg-[#161B22] rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <TrendingUp className="h-8 w-8 text-emerald-500" />
            <div>
              <h3 className="text-2xl font-bold">{leaderboardData.averageTrustScore}%</h3>
              <p className="text-sm text-gray-400">Average Trust Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#161B22] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0D1117]">
            <tr>
              <th className="px-6 py-4 text-left">RANK</th>
              <th className="px-6 py-4 text-left">INFLUENCER</th>
              <th className="px-6 py-4 text-left">CATEGORY</th>
              <th className="px-6 py-4 text-left">TRUST SCORE</th>
              <th className="px-6 py-4 text-left">TREND</th>
              <th className="px-6 py-4 text-left">FOLLOWERS</th>
              <th className="px-6 py-4 text-left">VERIFIED CLAIMS</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.leaderboard.map((influencer) => (
              <tr key={influencer.rank} className="border-t border-[#30363D] hover:bg-[#1C2128]">
                <td className="px-6 py-4">#{influencer.rank}</td>
                <td className="px-6 py-4">
                  <Link to={`/influencer/${influencer.name}`} className="text-emerald-500 hover:underline">
                    {influencer.name}
                  </Link>
                </td>
                <td className="px-6 py-4">{influencer.category}</td>
                <td className="px-6 py-4">
                  <span className="text-emerald-500">{influencer.trustScore}%</span>
                </td>
                <td className="px-6 py-4">
                  {influencer.trend === "0.00" ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  )}
                </td>
                <td className="px-6 py-4">{influencer.followers.toLocaleString()}</td>
                <td className="px-6 py-4">{influencer.verifiedClaims}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
