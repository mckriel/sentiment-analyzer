import React, { useState } from 'react';
import { ComprehendClient, DetectSentimentCommand } from '@aws-sdk/client-comprehend';
import './App.css';

// Create a sentiment interface
interface SentimentResult {
	text: string,
  	score: {
		Positive: number,
		Negative: number,
		Neutral: number,
		Mixed: number,
	};
}


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

			setResults(prev => [
				{
					text: inputText,
					score: {
						Positive: response.SentimentScore?.Positive || 0,
						Negative: response.SentimentScore?.Negative || 0,
						Neutral: response.SentimentScore?.Neutral || 0,
						Mixed: response.SentimentScore?.Mixed || 0,
					}
				},
				...prev
			]);
		}
		catch (error) {
			console.log(`Analysis failed: ${error}`);
		}
	};

	

	return (
		<div className="App">
			<form onSubmit={handleSubmit}>
				<input 
					type="text" 
					value={inputText}
					onChange={(e) => setInputText(e.target.value)}
					placeholder="Let's analyze some text!"
				/>
				<button type="submit">
					Get Sentiment
				</button>
				<button 
					type="button"
					onClick={async () => {
						try {
						const testCommand = new DetectSentimentCommand({
							Text: "I love this wonderful product!",
							LanguageCode: 'en'
						});
						const response = await client.send(testCommand);
						console.log("AWS TEST RESPONSE:", response);
						alert("AWS connection successful!\nSentiment: " + response.Sentiment);
						} catch (error) {
						console.error("AWS TEST FAILED:", error);
						alert("Connection failed. Check console for details.");
						}
					}}
					>
					Test AWS Connection
				</button>
			</form>
		</div>
	);
}

export default App;
