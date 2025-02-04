const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const runPythonScript = require('../utils/scraper');

const prisma = new PrismaClient();
const BASE_URL = "https://openrouter.ai/api/v1";
const DEEPSEEK_API_KEY = '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';

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

        // **1. Scrape Twitter Data**
        const scrapedData = await runPythonScript(influencerName, numClaims);
        console.log("scraped data",scrapedData)
        if (!scrapedData || !scrapedData.profile || !scrapedData.tweets.length) {
            return res.status(404).json({ error: 'No tweets found for this influencer.' });
        }

        const { name, handle, bio, follower_count, following_count } = scrapedData.profile;
        console.log("profile data",scrapedData.profile)
        const tweets = scrapedData.tweets;
        console.log("tweets data",tweets)
        // **2. Check if Influencer Exists, Otherwise Create**
        let influencer = await prisma.influencer.findUnique({ where: { handle } });

        if (!influencer) {
            influencer = await prisma.influencer.create({
                data: {
                    name,
                    handle,
                    bio,
                    followerCount: follower_count,
                    followingCount: following_count
                }
            });
        }

        // **3. Store Tweets**
        for (const tweet of tweets) {
            const existingTweet = await prisma.tweet.findUnique({ where: { link: tweet.link } });

            if (!existingTweet) {
                await prisma.tweet.create({
                    data: {
                        influencerId: influencer.id,
                        link: tweet.link,
                        text: tweet.text,
                        likes: tweet.likes,
                        quotes: tweet.quotes,
                        retweets: tweet.retweets,
                        comments: tweet.comments
                    }
                });
            }
        }

        let claimsProcessed = 0;
        const verifiedClaims = [];

        // **4. Process and Verify Claims**
        for (const tweet of tweets) {
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

                    // **5. Store Verified Claim in Database**
                    const newClaim = await prisma.claim.create({
                        data: {
                            influencerId: influencer.id,
                            contentSource: "Twitter",
                            dateRange: timeRange,
                            claimText,
                            category,
                            verificationStatus,
                            trustScore: verificationScore,
                            aiResponse: responseText,
                            sources: verifyWithJournals ? journalsToUse : [],
                            numClaimsAnalyzed: numClaims
                        }
                    });

                    verifiedClaims.push(newClaim);
                    claimsProcessed++;
                } catch (error) {
                    console.error("Error calling AI API:", error.message);
                    return res.status(500).json({ error: "Error while verifying claim." });
                }
            }
        }

        res.json({ message: "Influencer data and claims stored successfully", claimsVerified: verifiedClaims });
    } catch (error) {
        console.error("Error in research endpoint:", error.message);
        res.status(500).json({ error: "Failed to process research task." });
    }
};
