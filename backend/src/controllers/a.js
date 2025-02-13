// const axios = require('axios');
// const runPythonScript = require('../utils/scraper');
// const DEEPSEEK_API_KEY = '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';
// const BASE_URL = "https://openrouter.ai/api/v1";

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
//         const { influencerName, numClaims, timeRange, verifyWithJournals, journalsToUse } = req.body;

//         if (!influencerName || !numClaims || !journalsToUse) {
//             return res.status(400).json({ error: 'Missing required fields. Please provide all inputs.' });
//         }

//         console.log(`Fetching tweets for influencer: ${influencerName}`);
        
//         const scrapedData = await runPythonScript(influencerName, numClaims);
//         console.log("twitter data",scrapedData)
//         console.log("only tweet data")
//         if (!scrapedData || scrapedData.length === 0) {
//             return res.status(404).json({ error: 'No tweets found for this influencer.' });
//         }

//         let receiving_data= scrapedData.tweets
//         let claimsProcessed = 0;
//         const verifiedClaims = [];
    
//         for (const tweet of receiving_data) {
//             if (claimsProcessed >= numClaims) break;

//             const cleanedTweetText = cleanTweetContent(tweet.text);
//             const claimSentences = cleanedTweetText.split('. ');

//             for (const claimText of claimSentences) {
//                 if (claimsProcessed >= numClaims) break;

//                 const category = categorizeClaim(claimText);
//                 console.log("Analyzing Claim:", claimText);

//                 const aiRequestPayload = {
//                     model: "openai/gpt-3.5-turbo",
//                     messages: [{ role: "user", content: claimText }]
//                 };

//                 console.log("AI Request Payload:", aiRequestPayload);

//                 try {
//                     const aiResponse = await axios.post(`${BASE_URL}/chat/completions`, aiRequestPayload, {
//                         headers: {
//                             'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
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

//                     const verificationScore = Math.floor(Math.random() * 101);
//                     let verificationStatus = verificationScore >= 90 ? "✅ Verified"
//                         : verificationScore >= 50 ? "❓ Questionable"
//                         : "❌ Debunked";

//                     verifiedClaims.push({
//                         influencer: influencerName,
//                         contentSource: "Twitter",
//                         dateRange: timeRange,
//                         claim: claimText,
//                         category,
//                         verificationStatus,
//                         trustScore: verificationScore,
//                         aiResponse: responseText,
//                         sources: verifyWithJournals ? journalsToUse : [],
//                         numClaimsAnalyzed: numClaims
//                     });

//                     claimsProcessed++;
//                 } catch (error) {
//                     console.error("Error calling AI API:", error.message);
//                     return res.status(500).json({ error: "Error while verifying claim." });
//                 }
//             }
//         }

//         res.json({
//             claimsVerified: verifiedClaims
//         });
//     } catch (error) {
//         console.error("Error in research endpoint:", error.message);
//         res.status(500).json({ error: "Failed to process research task." });
//     }
// };


//2.


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

