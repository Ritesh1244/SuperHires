import sys
import asyncio
import json
from twikit import Client, TooManyRequests
from datetime import datetime
from random import randint
import os
from dotenv import load_dotenv

load_dotenv() 

MINIMUM_TWEETS = 10

async def get_tweets(client, tweets=None, influencer_username=None):
    if tweets is None:
        tweets = await client.search_tweet(f'(from:{influencer_username})', product='Top')
    else:
        await asyncio.sleep(randint(5, 10))
        tweets = await tweets.next()
    return tweets

async def fetch_tweet_data(influencer_username, min_tweets):
    username = os.getenv("TWITTER_USERNAME")
    email = os.getenv("TWITTER_EMAIL")
    password = os.getenv("TWITTER_PASSWORD")

    if not username or not email or not password:
        return {"error": "Missing Twitter login credentials"}

    client = Client(language='en-US')
    try:
        await client.login(auth_info_1=username, auth_info_2=email, password=password)
        client.save_cookies('cookies.json')
    except Exception as e:
        return {"error": f"Authentication failed: {str(e)}"}

    try:
        influencers = await client.search_user(influencer_username)
        influencer = influencers[0] if influencers else None
    except Exception as e:
        return {"error": f"Error fetching influencer profile: {str(e)}"}

    if not influencer:
        return {"error": "Influencer not found"}

    influencer_data = {
        'name': influencer.name,
        'handle': influencer.screen_name,
        'bio': influencer.description,
        'follower_count': influencer.followers_count,
        'following_count': getattr(influencer, 'following_count', "N/A")
    }

    tweet_count = 0
    tweets = None
    all_tweets = []

    while tweet_count < min_tweets:
        try:
            tweets = await get_tweets(client, tweets, influencer_username)
        except TooManyRequests as e:
            wait_time = max(10, (e.rate_limit_reset - datetime.now()).total_seconds())
            await asyncio.sleep(wait_time)
            continue
        except Exception as e:
            return {"error": f"Error fetching tweets: {str(e)}"}

        if not tweets:
            break

        for tweet in tweets:
            tweet_count += 1
            all_tweets.append({
                'link': f'https://twitter.com/{influencer_username}/status/{tweet.id}',
                'text': tweet.text,
                'user': tweet.user.name,
                'likes': tweet.favorite_count,
                'quotes': tweet.quote_count,
                'retweets': tweet.retweet_count,
                'comments': tweet.reply_count
            })
            if tweet_count >= min_tweets:
                break

    return {'profile': influencer_data, 'tweets': all_tweets}

async def main(username, min_tweets):
    data = await fetch_tweet_data(username, min_tweets)
    print(json.dumps(data, indent=4))  # Ensure clean JSON output

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Usage: python twiter_scraper.py <username> <number_of_tweets>"}))
        sys.exit(1)

    username = sys.argv[1]
    no_of_tweets = int(sys.argv[2])

    asyncio.run(main(username, no_of_tweets))


# 2 . code below
    
# from selenium import webdriver
# from selenium.webdriver.common.by import By
# from selenium.webdriver.common.keys import Keys  # Import Keys here
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC

# def scrape_twitter_data(username, num_tweets):
#     options = webdriver.ChromeOptions()
#     options.add_argument("--headless")  # Run in headless mode to not open a browser window
#     driver = webdriver.Chrome(options=options)

#     try:
#         driver.get(f'https://twitter.com/{username}')
        
#         # Scroll down to ensure that all dynamic content loads
#         body = driver.find_element(By.CSS_SELECTOR, 'body')
#         body.send_keys(Keys.END)  # Scroll to bottom to load content
        
#         # Wait for the profile image to load
#         WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'img[src*="profile_images"]')))
        
#         # Scrape Profile Image
#         profile_image = driver.find_element(By.CSS_SELECTOR, 'img[src*="profile_images"]')
#         profile_image_url = profile_image.get_attribute('src')

#         # Scrape Profile Name and Handle
#         profile_name = driver.find_element(By.CSS_SELECTOR, 'div[dir="ltr"] span').text
#         profile_handle = username  # Username is part of the URL

#         # Attempt to find followers and following counts, adjust the CSS selectors if needed
#         try:
#             followers_count = driver.find_element(By.CSS_SELECTOR, 'a[href$="/followers"] > span > span').text
#         except Exception as e:
#             followers_count = "Not found"
#             print(f"Error fetching followers count: {e}")
        
#         try:
#             following_count = driver.find_element(By.CSS_SELECTOR, 'a[href$="/following"] > span > span').text
#         except Exception as e:
#             following_count = "Not found"
#             print(f"Error fetching following count: {e}")

#         # Scrape Tweets
#         tweets = []
#         tweet_elements = driver.find_elements(By.CSS_SELECTOR, 'article div[lang]')
#         for tweet in tweet_elements[:num_tweets]:
#             tweet_text = tweet.text
#             tweets.append(tweet_text)

#         # Organize the scraped data
#         profile_data = {
#             "profile": {
#                 "name": profile_name,
#                 "handle": profile_handle,
#                 "profile_image": profile_image_url,
#                 "followers_count": followers_count,
#                 "following_count": following_count
#             },
#             "tweets": tweets
#         }

#         return profile_data

#     finally:
#         driver.quit()

# # Main execution
# username = input("Enter the Twitter username: ")
# num_tweets = int(input("Enter number of tweets to fetch: "))

# profile_data = scrape_twitter_data(username, num_tweets)
# print(profile_data)






    
# import pandas as pd
# from twikit import Client, TooManyRequests
# import asyncio
# from datetime import datetime
# from configparser import ConfigParser
# from random import randint
# import json
# from pprint import pprint

# # Number of tweets to fetch
# MINIMUM_TWEETS = 10
# INFLUENCER_USERNAME = 'kirat_tw'  # Replace with the influencer's username

# async def get_tweets(client, tweets=None):
#     if tweets is None:
#         print(f'{datetime.now()} - Getting initial tweets...')
#         tweets = await client.search_tweet(f'(from:{INFLUENCER_USERNAME})', product='Top')
#     else:
#         wait_time = randint(5, 10)
#         print(f'{datetime.now()} - Getting next tweets after {wait_time} seconds...')
#         await asyncio.sleep(wait_time)
#         tweets = await tweets.next()
#     return tweets

# async def fetch_tweet_data():
#     # Load login credentials
#     config = ConfigParser()
#     config.read('config.ini')
#     username = config['X']['username']
#     email = config['X']['email']
#     password = config['X']['password']

#     # Authenticate using cookies
#     client = Client(language='en-US')
#     client.load_cookies('cookies.json')

#     # Fetch influencer profile data
#     influencers = await client.search_user(INFLUENCER_USERNAME)
#     influencer = influencers[0] if influencers else None

#     if influencer:
#         influencer_data = {
#             'name': influencer.name,
#             'handle': influencer.screen_name,
#             'bio': influencer.description,
#             'follower_count': influencer.followers_count,
#             'following_count': getattr(influencer, 'following_count', "N/A")  # Safe attribute access
#         }
#         print("Profile Information:")
#         pprint(influencer_data)
#     else:
#         print("No influencer found.")
#         return None

#     tweet_count = 0
#     tweets = None
#     all_tweets = []

#     while tweet_count < MINIMUM_TWEETS:
#         try:
#             tweets = await get_tweets(client, tweets)
#         except TooManyRequests as e:
#             rate_limit_reset = datetime.fromtimestamp(e.rate_limit_reset)
#             print(f'{datetime.now()} - Rate limit reached. Waiting until {rate_limit_reset}')
#             wait_time = rate_limit_reset - datetime.now()
#             await asyncio.sleep(wait_time.total_seconds())
#             continue

#         if not tweets:
#             print(f'{datetime.now()} - No more tweets found')
#             break

#         # Process tweets
#         for tweet in tweets:
#             tweet_count += 1
#             all_tweets.append({
#                 'link': f'https://twitter.com/{INFLUENCER_USERNAME}/status/{tweet.id}',
#                 'text': tweet.text,
#                 'user': tweet.user.name,
#                 'likes': tweet.favorite_count,
#                 'quotes': tweet.quote_count,
#                 'retweets': tweet.retweet_count,
#                 'comments': tweet.reply_count  # Assuming 'reply_count' for comments
#             })
#             if tweet_count >= MINIMUM_TWEETS:
#                 break

#         print(f'{datetime.now()} - Fetched {tweet_count} tweets')

#     # Return the data as a DataFrame
#     df = pd.DataFrame(all_tweets)
#     print("\nTweets Data:")
#     print(df)  # Print the DataFrame to see the tweet data
#     return df

# async def main():
#     df = await fetch_tweet_data()
#     if df is not None:
       
# # Run the async function
# if __name__ == "__main__":
#     asyncio.run(main())