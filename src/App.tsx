import React, { useState, useEffect } from 'react';
import { ComprehendClient, DetectSentimentCommand } from '@aws-sdk/client-comprehend';
import './App.css';

interface SentimentResult {
	text: string,
	sentiment: string,
  	score: number,
}

// Assumption: Ordering is positive > neutral >mixed >negative
// Values can be adjusted if ordering is not correct
const SENTIMENT_PRIORITY: Record<string, number> = {
	'positive': 0,
	'neutral': 1,
	'mixed': 2,
	'negative': 3,
};


function App() {
	const [inputText, setInputText] = useState('');
	const [results, setResults] = useState<SentimentResult[]>([]);

	// AWS configuration
	const client = new ComprehendClient({ 
		region: process.env.REACT_APP_AWS_REGION,
		credentials: {
			accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID!,
			secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY!,
		} 
	});

	
	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!inputText.trim()) return;

		try {
			const command = new DetectSentimentCommand({
				Text: inputText,
				LanguageCode: 'en'
			});

			const response = await client.send(command);

			const sentimentScore = response.SentimentScore || {
				Positive: 0,
				Negative: 0,
				Neutral: 0,
				Mixed: 0,
			};

			type SentimentKey = 'Positive' | 'Negative' | 'Neutral' | 'Mixed';

			const sentimentMap: Record<string, SentimentKey> ={
				'POSITIVE': 'Positive',
				'NEGATIVE': 'Negative',
				'NEUTRAL': 'Neutral',
				'MIXED': 'Mixed',
			};

			const awsSentiment = response.Sentiment || 'NEUTRAL';
			const scoreKey = sentimentMap[awsSentiment] || 'Neutral';
			const dominantScore = sentimentScore[scoreKey] || 0;

			console.log("AWS RESPONSE:", response);

			setResults(prev => [
				{
				  text: inputText,
				  sentiment: awsSentiment.toLowerCase(),
				  score: dominantScore
				},
				...prev
			  ]);

			setInputText('');
		}
		catch (error) {
			console.log(`Analysis failed: ${error}`);
		}
	};

	useEffect(() => {
		console.log('Updated results:', results);
	}, [results]);

	// // First sort approach
	// const sortedResults = results
	// .map(result => ({
	// ...result,
	// priority: SENTIMENT_PRIORITY[result.sentiment],
	// scoreValue: result.score
	// }))
	// .sort((a, b) => {
	// // Sort by sentiment priority
	// if (a.priority !== b.priority) return a.priority - b.priority;
	// // Sort by score within the same sentiment
	// return b.scoreValue - a.scoreValue;
	// });

	// Bucket sort approach
	// Slightly more effecient approach, although both can be used
	const sortedResults = results.reduce((acc, result) => {
		const priority = SENTIMENT_PRIORITY[result.sentiment];
		acc[priority].push(result);
		return acc;
	  }, [[], [], [], []] as SentimentResult[][])
		.flatMap(bucket => 
		  bucket.sort((a, b) => b.score - a.score)
		);

	return (
		<div className="App">
			<form onSubmit={handleSubmit}>
				<input 
					type="text" 
					value={inputText}
					onChange={(e) => setInputText(e.target.value)}
					placeholder="Let's analyze some text!"
				/>
				<button type="submit">Get Sentiment</button>
			</form>
			<ul>
                {sortedResults.map((result, index) => (
                    <li key={index}>
                        <p>{result.text}</p>
                        <p>{result.sentiment} | {result.score} </p>
                    </li>
                ))}
            </ul>
		</div>
	);
}

export default App;
