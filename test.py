import requests
import json

# API endpoint
url = "https://api.guidmenext.com/v1/chat/completions"

# API headers
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer dev_secret_123"
}

# Data payload
data = {
    "model": "mistral:instruct",
    "messages": [
        {"role": "user", "content": "I am sad"}
    ]
}

try:
    # Sending POST request
    response = requests.post(url, headers=headers, data=json.dumps(data))

    # Check response status
    if response.status_code == 200:
        result = response.json()
        # Extract assistant reply
        print("Response JSON:", result)
        assistant_reply = result["choices"][0]["message"]["content"]
        print("Assistant:", assistant_reply)
    else:
        print(f"Error {response.status_code}: {response.text}")

except Exception as e:
    print("An error occurred:", str(e))