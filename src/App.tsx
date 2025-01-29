import { React, useState } from 'react';
import { ComprehendClient, DetectSentimentCommand } from '@aws-sdk/client-comprehend';
import './App.css';

// Create a sentiment interface
interface SentimentResult {
	text: string,
  	score: {
		Postive: number,
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
			</form>
		</div>
	);
}

export default App;
