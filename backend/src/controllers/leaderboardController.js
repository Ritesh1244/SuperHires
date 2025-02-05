const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getLeaderboard = async (req, res) => {
  try {
    // Fetch influencers with their claims
    const influencers = await prisma.influencer.findMany({
      include: {
        claims: true,
      },
    });

    // Initialize summary metrics
    let totalVerifiedClaims = 0;
    let totalTrustScore = 0;
    let totalClaimsAnalyzed = 0;

    // Format the leaderboard
    const leaderboard = influencers.map((influencer) => {
      const totalClaims = influencer.claims.length;
      const verifiedClaims = influencer.claims.filter(
        (c) => c.verificationStatus === "✅ Verified"
      ).length;

      const trustScore =
        totalClaims > 0
          ? influencer.claims.reduce((sum, claim) => sum + claim.trustScore, 0) / totalClaims
          : 0;

      const trustScoreHistory = influencer.trustScoreHistory || [];
      const trend =
        trustScoreHistory.length > 1
          ? trustScoreHistory[trustScoreHistory.length - 1] - trustScoreHistory[trustScoreHistory.length - 2]
          : 0;

      const category = totalClaims > 0 ? influencer.claims[0].category : "Unknown";

      // Update summary metrics
      totalVerifiedClaims += verifiedClaims;
      totalTrustScore += trustScore;
      totalClaimsAnalyzed += totalClaims;

      return {
        name: influencer.name,
        handle: influencer.handle, // Include the unique Twitter handle
        category,
        trustScore: trustScore.toFixed(2),
        trend: trend.toFixed(2),
        followers: influencer.followerCount,
        verifiedClaims,
      };
    });

    // Sort influencers by Trust Score (Descending)
    leaderboard.sort((a, b) => b.trustScore - a.trustScore);

    // Add Rank
    leaderboard.forEach((influencer, index) => {
      influencer.rank = index + 1;
    });

    // Compute Average Trust Score across all influencers
    const averageTrustScore = influencers.length > 0 ? (totalTrustScore / influencers.length).toFixed(2) : "0.00";

    res.json({
      totalActiveInfluencers: influencers.length,
      totalVerifiedClaims,
      averageTrustScore,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error.message);
    res.status(500).json({ error: "Failed to fetch leaderboard data" });
  }
};

