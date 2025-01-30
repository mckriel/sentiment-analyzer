# Sentiment Analyzer
<img width="575" alt="Screenshot 2025-01-30 at 13 46 35" src="https://github.com/user-attachments/assets/10ba5fa5-7fd0-485c-a1f6-9f03055b039d" />

## Approach and assumptions
### Approach
1. Only the sentiment score of the return sentiment will be displayed. This is to avoid clutter, provide a cleaner UI and not overload the user with information
2. Two primary files are to be used, namely
3. Test suite will only cover the sorting logic
4. Effiency and time complexity of sorting function was taken into consideration, however ultimately decided to go with the cleanest and most readable approach. See `misc-notes.txt` in root directory
### Assumptions:
1. Testing suite is only to cover the sorting logic as per the requirements documentation. No testing included for UI interactions or API calls
2. Presumed ordering is: positive > neutral > mixed > negative
3. Only using the dominant sentiment score is fine for this use case
### Confessions:
 - I spent more than the alloted time period of 3 hours on this project (probably 6 hours off the top of my head
 - I ran into tedious dependancy issues and I also wanted to experiment with various approaches, mostly around how I would be doing the sorting (examples can be seen in the misc-notes.txt file)
 - I made use of Copilot/Chatgpt to assist me with the styling of the page as well as checking the effeciency of my alogorithms and approach
## High level diagram
![social-assessment-high-level](https://github.com/user-attachments/assets/ee506868-9a36-41ef-b81a-707b03ef4c9c)
## Original UI diagram
![Social Engineer Assessment](https://github.com/user-attachments/assets/64a8d4de-9327-4b29-bfcb-4dbdf20ceed0)
## Installation
### .env.template
 1. A template for the .env file structure is provided
 2. Remove the placeholder text and insert your own API keys and AWS region
 3. Rename the file to .env
### Installation
Simply run:

    nmp install
    npm start
To run the test suite:

    npm test -- --coverage
### Test coverage:
1. Sorts by sentiment priority (POSITIVE > NEUTRAL > MIXED > NEGATIVE)
2. Sorts by score descending within same sentiment
3. Returns 0 for identical sentiment scores of the same sentiment
4. Sorts null values to the bottom
5. Handles identical objects
