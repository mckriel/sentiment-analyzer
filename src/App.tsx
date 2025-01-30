import React, { useState, useEffect, useMemo } from 'react';
import { ComprehendClient, DetectSentimentCommand } from '@aws-sdk/client-comprehend';
import './App.css';

export interface SentimentResult {
	text: string,
	sentiment: string,
  	score: number,
}

// assumption: ordering is positive > neutral >mixed >negative
// values can be adjusted if ordering is not correct
export const SENTIMENT_PRIORITY: Record<string, number> = {
	'positive': 0,
	'neutral': 1,
	'mixed': 2,
	'negative': 3,
};

export function compareSentiments(a: SentimentResult, b: SentimentResult) {
	// if a < b ==> a before b
	// if a > b ==> b before a
	// if a === b ==> no change
	const priorityA = SENTIMENT_PRIORITY[a.sentiment];
	const priorityB = SENTIMENT_PRIORITY[b.sentiment];
	return priorityA - priorityB || b.score - a.score;
}


function App() {
	const [inputText, setInputText] = useState('');
	const [results, setResults] = useState<SentimentResult[]>([]);

	// aws configuration
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

			// mapping aws sentiment to local keys
			// type SentimentKey = 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
			const sentimentMap: Record<string, keyof typeof sentimentScore> = {
				'POSITIVE': 'Positive',
				'NEGATIVE': 'Negative',
				'NEUTRAL': 'Neutral',
				'MIXED': 'Mixed'
			};

			// determines dominant score
			const awsSentiment = response.Sentiment || 'NEUTRAL';
			const scoreKey = sentimentMap[awsSentiment] as keyof typeof sentimentScore || 'Neutral';
			const dominantScore = Number(
				((response.SentimentScore?.[scoreKey] || 0) * 100).toFixed(2) // display as percentage
			); 

			// leaving in for debugging or response confirmation purposes
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

	const sortedResults = useMemo(() => 
		results.slice().sort(compareSentiments), 
		[results]
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
			<ul className="results-list">
				{sortedResults.map((result, index) => (
					<li key={index} className="result-item">
					<div className="text-block">
						<p className="input-text">{result.text}</p>
						<div className="sentiment-display">
						<span className={`sentiment-tag ${result.sentiment}`}>
							{result.sentiment}
						</span>
						<span className="sentiment-score">
							{result.score}%
						</span>
						</div>
					</div>
					</li>
				))}
			</ul>
		</div>
	);
}

export default App;
