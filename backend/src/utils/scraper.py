# import sys  
# import pandas as pd  
# from ntscraper import Nitter  
# import json  

# def create_tweets_dataset(username, no_of_tweets):  
#     scraper = Nitter()  

#     # Fetch profile information  
#     profile_info = scraper.get_profile_info(username=username)  

#     # Fetch tweets  
#     tweets = scraper.get_tweets(username, mode="user", number=no_of_tweets)  

#     # Structure tweet data  
#     tweet_data = []  
#     for tweet in tweets.get('tweets', []):  
#         tweet_data.append({  
#             "link": tweet.get("link", ""),  
#             "text": tweet.get("text", ""),  
#             "user": tweet.get("user", {}).get("name", ""),  
#             "likes": tweet["stats"].get("likes", 0),  
#             "quotes": tweet["stats"].get("quotes", 0),  
#             "retweets": tweet["stats"].get("retweets", 0),  
#             "comments": tweet["stats"].get("comments", 0)  
#         })  

#     # Combine profile and tweet data  
#     result = {  
#         "profile": profile_info,  # Include profile info  
#         "tweets": tweet_data  
#     }  

#     return json.dumps(result, indent=4)  

# if __name__ == "__main__":  
#     if len(sys.argv) < 3:  
#         print(json.dumps({"error": "Usage: python scraper.py <username> <number_of_tweets>"}))  
#         sys.exit(1)  

#     username = sys.argv[1]  
#     no_of_tweets = int(sys.argv[2])  

#     json_output = create_tweets_dataset(username, no_of_tweets)  

#     # Ensure only JSON is printed, suppress extra logs
#     print(json_output) # Output the result


# import sys
# import json
# import time
# from ntscraper import Nitter

# def create_tweets_dataset(username, no_of_tweets):
#     try:
#         # Try multiple Nitter instances in case one fails
#         nitter_instances = [
#             "https://nitter.privacydev.net",
#             "https://nitter.fdn.fr",
#             "https://nitter.nl"
#         ]

#         for instance in nitter_instances:
#             try:
#                 scraper = Nitter(instance=instance)

#                 # Fetch profile information
#                 profile_info = scraper.get_profile_info(username=username)

#                 # Fetch tweets
#                 tweets = scraper.get_tweets(username, mode="user", number=no_of_tweets)

#                 if "tweets" not in tweets or not tweets["tweets"]:
#                     continue  # Try next instance

#                 # Structure tweet data
#                 tweet_data = []
#                 for tweet in tweets.get("tweets", []):
#                     tweet_data.append({
#                         "link": tweet.get("link", ""),
#                         "text": tweet.get("text", ""),
#                         "user": tweet.get("user", {}).get("name", ""),
#                         "likes": tweet["stats"].get("likes", 0),
#                         "quotes": tweet["stats"].get("quotes", 0),
#                         "retweets": tweet["stats"].get("retweets", 0),
#                         "comments": tweet["stats"].get("comments", 0)
#                     })

#                 # Combine profile and tweet data
#                 result = {
#                     "profile": profile_info if profile_info else {},
#                     "tweets": tweet_data
#                 }

#                 return json.dumps(result, indent=4)

#             except Exception as e:
#                 print(f"Instance {instance} failed: {e}")
#                 time.sleep(2)  # Add a small delay before retrying

#         return json.dumps({"error": "All Nitter instances failed. Try again later."}, indent=4)

#     except Exception as e:
#         return json.dumps({"error": "Scraping failed", "details": str(e)}, indent=4)

# if __name__ == "__main__":
#     if len(sys.argv) < 3:
#         print(json.dumps({"error": "Usage: python scraper.py <username> <number_of_tweets>"}))
#         sys.exit(1)

#     username = sys.argv[1]
#     no_of_tweets = int(sys.argv[2])

#     json_output = create_tweets_dataset(username, no_of_tweets)

#     # Ensure only JSON is printed (no extra logs)
#     sys.stdout.write(json_output)


import sys
import json
import time
from ntscraper import Nitter

def create_tweets_dataset(username, no_of_tweets):
    username='kirat_tw'
    no_of_tweets=5
    try:
        # List of Nitter instances to try
        nitter_instances = [
            "https://nitter.net",
            "https://nitter.privacydev.net",
            "https://nitter.fdn.fr",
            "https://nitter.nl"
        ]
        
        for instance in nitter_instances:
            try:
                # Attempt scraping using the current instance
                scraper = Nitter(instance=instance)

                # Fetch profile information
                profile_info = scraper.get_profile_info(username=username)

                # Fetch tweets
                tweets = scraper.get_tweets(username, mode="user", number=no_of_tweets)

                if not tweets or "tweets" not in tweets or not tweets["tweets"]:
                    print(f"Failed to get data for {username} using instance {instance}. Trying next instance...")
                    continue  # Try next instance

                # Structure tweet data
                tweet_data = [
                    {
                        "link": tweet.get("link", ""),
                        "text": tweet.get("text", ""),
                        "user": tweet.get("user", {}).get("name", ""),
                        "likes": tweet["stats"].get("likes", 0),
                        "quotes": tweet["stats"].get("quotes", 0),
                        "retweets": tweet["stats"].get("retweets", 0),
                        "comments": tweet["stats"].get("comments", 0)
                    }
                    for tweet in tweets.get("tweets", [])
                ]

                # Combine profile and tweet data
                result = {
                    "profile": profile_info if profile_info else {},
                    "tweets": tweet_data
                }

                return json.dumps(result, indent=4)

            except Exception as e:
                print(f"Instance {instance} failed: {e}")
                time.sleep(2)  # Retry after a small delay

        # If all instances fail
        return json.dumps({"error": "All Nitter instances failed. Try again later."}, indent=4)

    except Exception as e:
        return json.dumps({"error": "Scraping failed", "details": str(e)}, indent=4)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python scraper.py <username> <number_of_tweets>"}))
        sys.exit(1)

    username = sys.argv[1]
    no_of_tweets = int(sys.argv[2])

    json_output = create_tweets_dataset('kirat_tw', 4)

    # Ensure only JSON is printed (no extra logs)
    sys.stdout.write(json_output)
