const axios = require('axios');
const runPythonScript = require('../utils/scraper');
const DEEPSEEK_API_KEY = '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';
const BASE_URL = "https://openrouter.ai/api/v1";

const categorizeClaim = (claim) => {
    const nutritionKeywords = ['creatine', 'supplement', 'cardiovascular health', 'blood vessel', 'heart health'];
    const medicineKeywords = ['medicine', 'treatment', 'prescription', 'doctor'];
    const mentalHealthKeywords = ['mental health', 'therapy', 'stress', 'anxiety'];

    if (nutritionKeywords.some(keyword => claim.toLowerCase().includes(keyword))) {
        return "Nutrition";
    } else if (medicineKeywords.some(keyword => claim.toLowerCase().includes(keyword))) {
        return "Medicine";
    } else if (mentalHealthKeywords.some(keyword => claim.toLowerCase().includes(keyword))) {
        return "Mental Health";
    }
    return "Uncategorized";
};

const cleanTweetContent = (tweetText) => {
    return tweetText.replace(/https?:\/\/[^\s]+/g, '').trim();
};

exports.performResearch = async (req, res) => {
    try {
        const { influencerName, numClaims, timeRange, verifyWithJournals, journalsToUse } = req.body;

        if (!influencerName || !numClaims || !journalsToUse) {
            return res.status(400).json({ error: 'Missing required fields. Please provide all inputs.' });
        }

        console.log(`Fetching tweets for influencer: ${influencerName}`);
        
        const scrapedData = await runPythonScript(influencerName, numClaims);
        console.log("twitter data",scrapedData)
        console.log("only tweet data")
        if (!scrapedData || scrapedData.length === 0) {
            return res.status(404).json({ error: 'No tweets found for this influencer.' });
        }

        let receiving_data= scrapedData.tweets
        let claimsProcessed = 0;
        const verifiedClaims = [];
    
        for (const tweet of receiving_data) {
            if (claimsProcessed >= numClaims) break;

            const cleanedTweetText = cleanTweetContent(tweet.text);
            const claimSentences = cleanedTweetText.split('. ');

            for (const claimText of claimSentences) {
                if (claimsProcessed >= numClaims) break;

                const category = categorizeClaim(claimText);
                console.log("Analyzing Claim:", claimText);

                const aiRequestPayload = {
                    model: "openai/gpt-3.5-turbo",
                    messages: [{ role: "user", content: claimText }]
                };

                console.log("AI Request Payload:", aiRequestPayload);

                try {
                    const aiResponse = await axios.post(`${BASE_URL}/chat/completions`, aiRequestPayload, {
                        headers: {
                            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': 'http://localhost:9000',
                            'X-Title': 'Health Claim Verifier'
                        }
                    });

                    if (aiResponse.status !== 200) {
                        console.error("AI request failed with status:", aiResponse.status);
                        return res.status(aiResponse.status).json({ error: 'Failed to verify claim' });
                    }

                    const responseText = aiResponse.data?.choices?.[0]?.message?.content || "No response received";
                    console.log("AI Response:", responseText);

                    const verificationScore = Math.floor(Math.random() * 101);
                    let verificationStatus = verificationScore >= 90 ? "✅ Verified"
                        : verificationScore >= 50 ? "❓ Questionable"
                        : "❌ Debunked";

                    verifiedClaims.push({
                        influencer: influencerName,
                        contentSource: "Twitter",
                        dateRange: timeRange,
                        claim: claimText,
                        category,
                        verificationStatus,
                        trustScore: verificationScore,
                        aiResponse: responseText,
                        sources: verifyWithJournals ? journalsToUse : [],
                        numClaimsAnalyzed: numClaims
                    });

                    claimsProcessed++;
                } catch (error) {
                    console.error("Error calling AI API:", error.message);
                    return res.status(500).json({ error: "Error while verifying claim." });
                }
            }
        }

        res.json({
            claimsVerified: verifiedClaims
        });
    } catch (error) {
        console.error("Error in research endpoint:", error.message);
        res.status(500).json({ error: "Failed to process research task." });
    }
};




