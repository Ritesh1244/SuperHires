
// const { PrismaClient } = require('@prisma/client');
// const axios = require('axios');
// const runPythonScript = require('../utils/scraper');

// const prisma = new PrismaClient();
// const BASE_URL = "https://openrouter.ai/api/v1";
// // const DEEPSEEK_API_KEY = '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';
// const deepseekurl= process.env.DEEPSEEK_API_KEY
// const categorizeClaim = (claim) => {
//     const nutritionKeywords = ['creatine', 'supplement', 'cardiovascular health', 'blood vessel', 'heart health'];
//     const medicineKeywords = ['medicine', 'treatment', 'prescription', 'doctor'];
//     const mentalHealthKeywords = ['mental health', 'therapy', 'stress', 'anxiety'];

//     if (nutritionKeywords.some(keyword => claim.toLowerCase().includes(keyword))) {
//         return "Nutrition";
//     } else if (medicineKeywords.some(keyword => claim.toLowerCase().includes(keyword))) {
//         return "Medicine";
//     } else if (mentalHealthKeywords.some(keyword => claim.toLowerCase().includes(keyword))) {
//         return "Mental Health";
//     }
//     return "Uncategorized";
// };

// const cleanTweetContent = (tweetText) => {
//     return tweetText.replace(/https?:\/\/[^\s]+/g, '').trim();
// };

// exports.performResearch = async (req, res) => {
//     try {
//         const { 
//             researchType = 'specific', 
//             influencerName,
//             timeRange = 'Last Week',
//             tweetnumber,
//             numClaims = 0,  
//             productsPerInfluencer = 0,
//             includeRevenueAnalysis = false,
//             verifyWithJournals = false,
//             journalsToUse = [],
//             notes = ''
//         } = req.body;

//         if (!influencerName || !numClaims) {
//             return res.status(400).json({ error: 'Missing required fields. Please provide all inputs.' });
//         }

//         console.log(`Checking if influencer exists in the database: ${influencerName}`);

//         // **1. Check if Influencer Exists**
//         let influencer = await prisma.influencer.findFirst({
//             where: { name: influencerName },
//             include: { tweets: true }
//         });

//         let tweets = [];
//         if (influencer && influencer.tweets.length) {
//             console.log(`Influencer ${influencerName} found in DB. Fetching stored tweets.`);
//             tweets = influencer.tweets;
//         } else {
//             console.log(`Influencer ${influencerName} not found or has no tweets. Fetching via scraping.`);
            
//             // **2. Scrape Twitter Data**
//             const scrapedData = await runPythonScript(influencerName, tweetnumber);
//             console.log("scraped data is", scrapedData);
//             if (!scrapedData || !scrapedData.profile || !scrapedData.tweets.length) {
//                 return res.status(404).json({ error: 'No tweets found for this influencer.' });
//             }

//             const { name, handle, bio, follower_count, following_count } = scrapedData.profile;
//             tweets = scrapedData.tweets;

//             // **3. Store Influencer (only if tweets are found)**
//             influencer = await prisma.influencer.upsert({
//                 where: { handle },
//                 update: { bio, followerCount: follower_count, followingCount: following_count },
//                 create: {
//                     name,
//                     handle,
//                     bio,
//                     followerCount: follower_count,
//                     followingCount: following_count
//                 }
//             });

//             // **4. Store Tweets**
//             for (const tweet of tweets) {
//                 await prisma.tweet.upsert({
//                     where: { link: tweet.link },
//                     update: {},
//                     create: {
//                         influencerId: influencer.id,
//                         link: tweet.link,
//                         text: tweet.text,
//                         likes: tweet.likes,
//                         quotes: tweet.quotes,
//                         retweets: tweet.retweets,
//                         comments: tweet.comments
//                     }
//                 });
//             }
//         }

//         let claimsProcessed = 0;
//         const verifiedClaims = [];

//         // **5. Process and Verify Claims**
//         for (const tweet of tweets) {
//             if (claimsProcessed >= numClaims) break; // Stop when numClaims is reached

//             const cleanedTweetText = cleanTweetContent(tweet.text);
//             const claimSentences = cleanedTweetText.split('. '); // Split into claims

//             for (const claimText of claimSentences) {
//                 if (claimsProcessed >= numClaims) break; // Stop when numClaims is reached

//                 if (claimText.length < 10) continue; // Ignore short or irrelevant sentences

//                 const category = categorizeClaim(claimText);
//                 console.log("Analyzing Claim:", claimText);

//                 const aiRequestPayload = {
//                     model: "openai/gpt-3.5-turbo",
//                     messages: [
//                         {
//                             role: "system",
//                             content: "You are an AI that evaluates health claims based on scientific research. Provide a trust score (0-100) and a verification status (Verified, Questionable, Debunked) based on credibility."
//                         },
//                         {
//                             role: "user",
//                             content: `Evaluate this health claim: "${claimText}". Give a trust score (0-100) and classify it as Verified, Questionable, or Debunked. Time range for verification: ${timeRange}`
//                         }
//                     ]
//                 };

//                 try {
//                     const aiResponse = await axios.post(`${BASE_URL}/chat/completions`, aiRequestPayload, {
//                         headers: {
//                             'Authorization': `Bearer ${deepseekurl}`,
//                             'Content-Type': 'application/json',
//                             'HTTP-Referer': 'http://localhost:9000',
//                             'X-Title': 'Health Claim Verifier'
//                         }
//                     });

//                     if (aiResponse.status !== 200) {
//                         console.error("AI request failed with status:", aiResponse.status);
//                         return res.status(aiResponse.status).json({ error: 'Failed to verify claim' });
//                     }

//                     const responseText = aiResponse.data?.choices?.[0]?.message?.content || "No response received";
//                     console.log("AI Response:", responseText);

//                     // Extract trust score from AI response (defaulting to 50 if extraction fails)
//                     const trustScoreMatch = responseText.match(/\b(\d{1,3})\b/);
//                     const verificationScore = trustScoreMatch ? Math.min(100, Math.max(0, parseInt(trustScoreMatch[1]))) : 50;

//                     let verificationStatus = "❓ Questionable";
//                     if (verificationScore >= 90) {
//                         verificationStatus = "✅ Verified";
//                     } else if (verificationScore < 50) {
//                         verificationStatus = "❌ Debunked";
//                     }

//                     // **6. Store Verified Claim**
//                     const newClaim = await prisma.claim.create({
//                         data: {
//                             influencerId: influencer.id,
//                             contentSource: "Twitter",
//                             dateRange: timeRange,
//                             claimText,
//                             category,
//                             verificationStatus,
//                             trustScore: verificationScore,
//                             aiResponse: responseText,
//                             sources: verifyWithJournals && journalsToUse.length ? journalsToUse : [],
//                             numClaimsAnalyzed: numClaims
//                         }
//                     });

//                     verifiedClaims.push(newClaim);
//                     claimsProcessed++;
//                 } catch (error) {
//                     console.error("Error calling AI API:", error.message);
//                     return res.status(500).json({ error: "Error while verifying claim." });
//                 }
//             }
//         }
       
//         res.json({ 
//             message: "Influencer data and claims stored successfully", 
//             profile_deyails:{
//                 name, handle, bio, follower_count, following_count
//             },
//             claimsVerified: verifiedClaims 
//         });

//     } catch (error) {
//         console.error("Error in research endpoint:", error.message);
//         res.status(500).json({ error: "Failed to process research task.", error: error.message });
//     }
// };



const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const runPythonScript = require('../utils/scraper');

const prisma = new PrismaClient();
const BASE_URL = "https://openrouter.ai/api/v1";
const deepseekurl = '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';

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

const cleanClaimText = (text) => {
    return text.replace(/[^\w\s.,!?]/g, '').trim(); // Remove special characters
};

exports.performResearch = async (req, res) => {
    try {
        const { influencerName, tweetnumber, numClaims = 5,timeRange,verifyWithJournals,journalsToUse } = req.body;

        if (!influencerName || !numClaims) {
            return res.status(400).json({ error: 'Missing required fields. Please provide all inputs.' });
        }

        console.log(`Checking if influencer exists in the database: ${influencerName}`);

        // Check if influencer exists in the database
        let influencer = await prisma.influencer.findFirst({
            where: {
                handle: {
                    equals: influencerName,
                    mode: 'insensitive' // Case-insensitive search
                }
            },
            include: { tweets: true, claims: true }
        });

        let tweets = [];
        if (influencer && influencer.tweets.length) {
            console.log(`Influencer ${influencerName} found in DB. Fetching stored tweets.`);
            tweets = influencer.tweets;
            console.log(`Fetched ${tweets.length} tweets from database for influencer: ${influencerName}`);
            tweets.forEach((tweet, index) => {
                console.log(`Tweet ${index + 1}: ${tweet.text}`);
            });
        }else {
            console.log(`Influencer ${influencerName} not found or has no tweets. Fetching via scraping.`);
            const scrapedData = await runPythonScript(influencerName, tweetnumber);
            console.log("scrapped data", scrapedData);
            if (!scrapedData || !scrapedData.profile || !scrapedData.tweets.length) {
                return res.status(404).json({ error: 'No tweets found for this influencer.' });
            }

            const { name, handle, bio, follower_count, following_count } = scrapedData.profile;
            tweets = scrapedData.tweets;

            // Store influencer and tweets in the database
            try {
                influencer = await prisma.influencer.upsert({
                    where: { handle: influencerName.toLowerCase() }, // Ensure handle is lowercase
                    update: { bio, followerCount: follower_count, followingCount: following_count },
                    create: {
                        name,
                        handle, // Ensure handle is lowercase
                        bio,
                        followerCount: follower_count,
                        followingCount: following_count
                    }
                });

                console.log(`Influencer ${influencerName} saved to database.`);

                for (const tweet of tweets) {
                    await prisma.tweet.upsert({
                        where: { link: tweet.link },
                        update: {},
                        create: {
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

                console.log(`Tweets for ${influencerName} saved to database.`);
            } catch (error) {
                console.error("Error saving influencer or tweets to database:", error.message);
                throw error; // Re-throw the error to stop further execution
            }
        }

        // Process and verify claims
        let claimsProcessed = 0;
        const verifiedClaims = [];

        for (const tweet of tweets) {
            if (claimsProcessed >= numClaims) break;

            const cleanedTweetText = cleanClaimText(tweet.text);
            const claimSentences = cleanedTweetText.split('. ');

            for (const claimText of claimSentences) {
                if (claimsProcessed >= numClaims) break;

                if (claimText.length < 10) continue;

                // Check if claim already exists in the database
                const existingClaim = await prisma.claim.findFirst({
                    where: {
                        influencerId: influencer.id,
                        claimText: claimText
                    }
                });

                if (existingClaim) {
                    console.log(`Claim already exists: ${claimText}`);
                    verifiedClaims.push(existingClaim);
                    claimsProcessed++;
                    continue;
                }

                const category = categorizeClaim(claimText);
                console.log("Analyzing Claim:", claimText);

                const cleanedClaimText = cleanClaimText(claimText);
                console.log("claimtext is",cleanClaimText)
                const aiRequestPayload = {
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are an AI that evaluates health claims based on scientific research. Provide a trust score (0-100) and a verification status (Verified, Questionable, Debunked) based on credibility."
                        },
                        {
                            role: "user",
                            content: `Evaluate this health claim: "${cleanedClaimText}". Give a trust score (0-100) and classify it as Verified, Questionable, or Debunked.`
                        }
                    ]
                };

                try {
                    const aiResponse = await axios.post(`${BASE_URL}/chat/completions`, aiRequestPayload, {
                        headers: {
                            'Authorization': `Bearer ${deepseekurl}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    const responseText = aiResponse.data?.choices?.[0]?.message?.content || "No response received";
                    console.log("AI Response:", responseText);

                    const trustScoreMatch = responseText.match(/\b(\d{1,3})\b/);
                    const verificationScore = trustScoreMatch ? Math.min(100, Math.max(0, parseInt(trustScoreMatch[1]))) : 50;

                    let verificationStatus = "❓ Questionable";
                    if (verificationScore >= 90) {
                        verificationStatus = "✅ Verified";
                    } else if (verificationScore < 50) {
                        verificationStatus = "❌ Debunked";
                    }

                    const newClaim = await prisma.claim.create({
                        data: {
                            influencerId: influencer.id,
                            contentSource: "Twitter",
                            claimText,
                            category,
                            verificationStatus,
                            trustScore: verificationScore,
                            aiResponse: responseText,
                            dateRange: timeRange,
                            sources: verifyWithJournals && journalsToUse.length ? journalsToUse : [],
                            numClaimsAnalyzed: numClaims
                        }
                    });

                    verifiedClaims.push(newClaim);
                    claimsProcessed++;
                } catch (error) {
                    console.error("Error calling AI API:", error.response?.data || error.message);
                    return res.status(500).json({ error: "Error while verifying claim." });
                }
            }
        }

        // Prepare the response with scraped profile data and AI claims data
        const responseData = {
            status: "success",
            timestamp: new Date().toISOString(),
            data: {
                profile: {
                    name: influencer.name,
                    handle: influencer.handle,
                    bio: influencer.bio,
                    followerCount: influencer.followerCount,
                    followingCount: influencer.followingCount
                },
                tweets: tweets.map(tweet => ({
                    link: tweet.link,
                    text: tweet.text,
                    likes: tweet.likes,
                    quotes: tweet.quotes,
                    retweets: tweet.retweets,
                    comments: tweet.comments
                })),
                claimsVerified: verifiedClaims.map(claim => ({
                    claimText: claim.claimText,
                    category: claim.category,
                    dateRange: timeRange,
                    verificationStatus: claim.verificationStatus,
                    trustScore: claim.trustScore,
                    aiResponse: claim.aiResponse
                }))
            }
        };

        res.json(responseData);
    } catch (error) {
        console.error("Error in research endpoint:", error.message);
        res.status(500).json({
            status: "error",
            message: "Failed to process research task.",
            details: error.message
        });
    }
};
