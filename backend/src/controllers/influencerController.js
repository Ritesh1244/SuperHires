const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getInfluencerDetails = async (req, res) => {
    try {
        const { handle } = req.params;

        // Fetch influencer with claims and tweets (remove "products")
        const influencer = await prisma.influencer.findUnique({
            where: { handle },
            include: {
                claims: true, // Fetch related claims
                tweets: true, // Fetch related tweets
            },
        });

        if (!influencer) {
            return res.status(404).json({ error: "Influencer not found" });
        }

        // Calculate Trust Score
        const totalClaims = influencer.claims.length;
        const verifiedClaims = influencer.claims.filter(claim => claim.verificationStatus === "✅ Verified");
        const trustScore = totalClaims > 0 ? Math.round((verifiedClaims.length / totalClaims) * 100) : 0;

        // Categorizing claims
        const categories = {};
        const verificationStatusCounts = { Verified: 0, Questionable: 0, Debunked: 0 };

        influencer.claims.forEach(claim => {
            // Group by category
            if (!categories[claim.category]) {
                categories[claim.category] = [];
            }
            categories[claim.category].push({
                date: claim.createdAt.toISOString().split("T")[0],
                text: claim.claimText,
                verificationStatus: claim.verificationStatus,
                trustScore: `${claim.trustScore}%`,
                sources: claim.sources,
            });

            // Count verification statuses
            if (claim.verificationStatus.includes("✅")) verificationStatusCounts.Verified++;
            else if (claim.verificationStatus.includes("❓")) verificationStatusCounts.Questionable++;
            else if (claim.verificationStatus.includes("❌")) verificationStatusCounts.Debunked++;
        });

        // Structuring the response
        const response = {
            name: influencer.name,
            bio: influencer.bio,
            trustScore: `${trustScore}%`,
            yearlyRevenue: "$5.0M", // Placeholder
            tweets: influencer.tweets.length, // Corrected this field
            followers: `${influencer.followerCount.toLocaleString()}+`,
            claimAnalysis: {
                categories: Object.keys(categories), // List of categories
                verificationStatus: verificationStatusCounts, // Count of verified/questionable/debunked claims
                claims: categories, // Claims grouped by category
            },
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching influencer details:", error.message);
        res.status(500).json({ error: "Failed to fetch influencer details." });
    }
};
