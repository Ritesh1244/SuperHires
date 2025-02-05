  import React, { useState } from 'react';
  import { ArrowLeft, Plus, Search } from 'lucide-react';
  import { Link } from 'react-router-dom';
  import { useNavigate } from "react-router-dom";

  const AdminPanel = () => {
    const [loading, setLoading] = useState(false);
    const [researchType, setResearchType] = useState('specific'); // 'specific' or 'discover'
    const [influencerName, setInfluencerName] = useState('');
    const [timeRange, setTimeRange] = useState('Last Month');
    const [numClaims, setNumClaims] = useState(50);
    const [tweetnumber,setTweetNumber] = useState(0)
    const [productsPerInfluencer, setProductsPerInfluencer] = useState(10);
    const [includeRevenue, setIncludeRevenue] = useState(false);
    const [verifyJournals, setVerifyJournals] = useState(false);
    const [selectedJournals, setSelectedJournals] = useState([
      'PubMed Central',
      'Nature',
      'Science',
      'Cell',
      'The Lancet',
      'New England Journal of Medicine',
      'JAMA Network'
    ]);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleTimeRangeClick = (range) => {
      setTimeRange(range);
    };

    const handleJournalToggle = (journal) => {
      setSelectedJournals(prev => 
        prev.includes(journal)
          ? prev.filter(j => j !== journal)
          : [...prev, journal]
      );
    };

    const handleSelectAllJournals = () => {
      setSelectedJournals([
        'PubMed Central',
        'Nature',
        'Science',
        'Cell',
        'The Lancet',
        'New England Journal of Medicine',
        'JAMA Network'
      ]);
    };

    const handleDeselectAllJournals = () => {
      setSelectedJournals([]);
    };

    const handleStartResearch = async () => {
      if (researchType === 'specific' && !influencerName.trim()) {
        setError('Please enter an influencer name');
        return;
      }

      if (verifyJournals && selectedJournals.length === 0) {
        setError('Please select at least one journal for verification');
        return;
      }

      setLoading(true);
      setError('');

      const payload = {
        researchType,
        influencerName: researchType === 'specific' ? influencerName : '',
        tweetnumber: parseInt(tweetnumber),  
        timeRange,
        numClaims: parseInt(numClaims),
        productsPerInfluencer: parseInt(productsPerInfluencer),
        includeRevenueAnalysis: includeRevenue,
        verifyWithJournals: verifyJournals,
        journalsToUse: verifyJournals ? selectedJournals : [],
        notes: notes || ''  // This ensures notes are sent as an empty string if not provided
      };
      
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/research`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to start research');
        }

        console.log('Research started successfully:', data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      navigate("/leaderboard");
    };

    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center space-x-2 mb-8">
          <ArrowLeft className="h-5 w-5 text-emerald-500" />
          <span className="text-emerald-500">Back to Dashboard</span>
          <h1 className="text-2xl font-bold ml-4">Research Tasks</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-[#161B22] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="w-5 h-5 bg-emerald-500/20 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
            Research Configuration
          </h2>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div 
              onClick={() => setResearchType('specific')}
              className={`bg-[#0D1117] border rounded p-4 cursor-pointer ${
                researchType === 'specific' 
                  ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20'
                  : 'border-[#30363D]'
              }`}
            >
              <h3 className="text-sm font-medium mb-2">Specific Influencer</h3>
              <p className="text-sm text-gray-400">Research a known health influencer by name</p>
            </div>
            
            <div 
              onClick={() => setResearchType('discover')}
              className={`bg-[#0D1117] border rounded p-4 cursor-pointer ${
                researchType === 'discover' 
                  ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20' 
                  : 'border-[#30363D]'
              }`}
            >
              <h3 className="text-sm font-medium mb-2">Discover New</h3>
              <p className="text-sm text-gray-400">Find and analyze new health influencers</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Time Range</label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button 
                    onClick={() => handleTimeRangeClick('Last Week')}
                    className={`px-4 py-2 rounded text-sm border ${
                      timeRange === 'Last Week'
                        ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20'
                        : 'bg-[#0D1117] border-[#30363D]'
                    }`}
                  >
                    Last Week
                  </button>
                  <button 
                    onClick={() => handleTimeRangeClick('Last Month')}
                    className={`px-4 py-2 rounded text-sm border ${
                      timeRange === 'Last Month'
                        ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20'
                        : 'bg-[#0D1117] border-[#30363D]'
                    }`}
                  >
                    Last Month
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleTimeRangeClick('Last Year')}
                    className={`px-4 py-2 rounded text-sm border ${
                      timeRange === 'Last Year'
                        ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20'
                        : 'bg-[#0D1117] border-[#30363D]'
                    }`}
                  >
                    Last Year
                  </button>
                  <button 
                    onClick={() => handleTimeRangeClick('All Time')}
                    className={`px-4 py-2 rounded text-sm border ${
                      timeRange === 'All Time'
                        ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20'
                        : 'bg-[#0D1117] border-[#30363D]'
                    }`}
                  >
                    All Time
                  </button>
                </div>
              </div>

              {researchType === 'specific' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Influencer Name</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={influencerName}
                      onChange={(e) => setInfluencerName(e.target.value)}
                      placeholder="Enter influencer name"
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Claims to Analyze Per Influencer</label>
                <input
                  type="number"
                  value={numClaims}
                  onChange={(e) => setNumClaims(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-gray-400 mt-1">Recommended: 50-100 claims for comprehensive analysis</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Products to Find Per Influencer</label>
                <input
                  type="number"
                  value={productsPerInfluencer}
                  onChange={(e) => setProductsPerInfluencer(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-gray-400 mt-1">Set to 0 to skip product research</p>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="text-sm font-medium">Include Revenue Analysis</h3>
                  <p className="text-xs text-gray-400">Analyze monetization methods and estimate earnings</p>
                </div>
                <button
                  onClick={() => setIncludeRevenue(!includeRevenue)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    includeRevenue ? 'bg-emerald-500' : 'bg-[#30363D]'
                  } relative`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      includeRevenue ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="text-sm font-medium">Verify with Scientific Journals</h3>
                  <p className="text-xs text-gray-400">Cross-reference claims with scientific literature</p>
                </div>
                <button
                  onClick={() => setVerifyJournals(!verifyJournals)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    verifyJournals ? 'bg-emerald-500' : 'bg-[#30363D]'
                  } relative`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      verifyJournals ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  ></div>
                </button>
              </div>
              
            </div>
            <div>
  <label className="block text-sm font-medium mb-2">No of Tweets</label>
  <input
    type="number"
    value={tweetnumber}
    onChange={(e) => setTweetNumber(e.target.value)}
    className="w-full bg-[#0D1117] border border-[#30363D] rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
  />
</div>

          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium">Scientific Journals</label>
              <div className="flex gap-4 text-sm">
                <button 
                  onClick={handleSelectAllJournals}
                  className="text-emerald-500"
                >
                  Select All
                </button>
                <button 
                  onClick={handleDeselectAllJournals}
                  className="text-emerald-500"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                'PubMed Central',
                'Nature',
                'Science',
                'Cell',
                'The Lancet',
                'New England Journal of Medicine',
                'JAMA Network'
              ].map((journal) => (
                <div 
                  key={journal} 
                  onClick={() => handleJournalToggle(journal)}
                  className="flex items-center justify-between bg-[#0D1117] px-4 py-3 rounded border border-[#30363D] cursor-pointer hover:border-emerald-500/50"
                >
                  <span className="text-sm">{journal}</span>
                  <div className={`w-4 h-4 rounded-full ${selectedJournals.includes(journal) ? 'bg-emerald-500' : 'bg-[#30363D]'}`}></div>
                </div>
              ))}
            </div>
            <button className="flex items-center space-x-2 text-emerald-500 mt-4">
              <Plus className="h-4 w-4" />
              <span>Add New Journal</span>
            </button>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Notes for Research Assistant</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any specific instructions or focus areas..."
              className="w-full bg-[#0D1117] border border-[#30363D] rounded px-4 py-2 text-sm text-white h-24 focus:outline-none focus:border-emerald-500"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleStartResearch}
            disabled={loading}
            className={`bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {loading ? 'Processing...' : 'Start Research'}
          </button>
        
        </div>
      </div>
    );
  }

  export default AdminPanel