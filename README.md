# Verify Influencers - Admin Panel

## 🚀 Project Overview

**Verify Influencers** is an admin panel that scrapes and analyzes health-related content from influencers (tweets and podcasts), identifies key health claims, verifies them against scientific journals, and presents the results in an intuitive dashboard. 

This project aims to bring clarity and credibility to online health information by leveraging AI-powered claim verification. 

## 🛠 Features

✅ **Influencer Content Scraping** - Extracts health-related tweets using a Twitter scraper.  
✅ **Claim Identification & Categorization** - Identifies health-related claims and categorizes them into Nutrition, Medicine, and Mental Health.  
✅ **AI-Based Claim Verification** - Uses AI (Perplexity/OpenAI API) to verify claims and assigns a trust score.  
✅ **Influencer Leaderboard** - Ranks influencers based on their credibility.  
✅ **Admin Dashboard** - Displays influencer details, verified claims, and confidence scores in a user-friendly UI.  
✅ **Configurable Research Options** - Allows customization of verification sources, date ranges, and number of claims to analyze.  

---

## 📌 Tech Stack

### **Backend**:
- **Node.js + Express** - API server for processing claims.
- **Prisma (PostgreSQL)** - Database to store influencers, tweets, and claim verification results.
- **Twikit** - Twitter scraping library for fetching influencer tweets.
- **OpenAI API / Perplexity API** - AI models for claim verification.
- **dotenv** - Manages environment variables.

### **Frontend**:
- **React.js + TailwindCSS** - Admin panel for managing influencer claims.
- **Vercel Deployment** - Hosted for easy access.

---

## 🏗 Project Workflow

### **1️⃣ Scraping Influencer Content**
- Uses `twikit` to scrape recent tweets from a specified health influencer.
- Extracts key metadata such as tweet text, likes, comments, and retweets.
- Stores influencer profile information and tweets in the database.
-Give to open Ai Model for varefying the claim what influencier are making in tweet
```python
async def fetch_tweet_data(influencer_username, min_tweets):
    client = Client(language='en-US')
    await client.login(auth_info_1=username, auth_info_2=email, password=password)
    tweets = await client.search_tweet(f'(from:{influencer_username})', product='Top')
    return {'profile': influencer_data, 'tweets': all_tweets}
