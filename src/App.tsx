import React, { useState, useEffect, useMemo } from 'react';
import { ComprehendClient, DetectSentimentCommand } from '@aws-sdk/client-comprehend';
import './App.css';
import { 
	Container,
	TextField,
	Button,
	List,
	ListItem,
	ListItemText,
	Chip,
	Paper,
	Typography,
	Slide,
	Zoom,
	Fade
  } from '@mui/material';
import { styled } from '@mui/material/styles';

const AnimatedContainer = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(4),
	marginTop: theme.spacing(4),
	borderRadius: '16px',
	boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
	transition: 'all 0.3s ease',
}));
  
  const SentimentItem = styled(ListItem)(({ theme }) => ({
	backgroundColor: theme.palette.background.paper,
	margin: theme.spacing(1),
	borderRadius: '12px',
	transition: 'all 0.2s ease',
	'&:hover': {
	  transform: 'translateY(-2px)',
	  boxShadow: theme.shadows[2]
	}
}));

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

export function compareSentiments(a: SentimentResult | null, b: SentimentResult | null): number {
	// Handle null/undefined cases
	// handle null or undefined
    if (a === null || a === undefined) {
        if (b === null || b === undefined) return 0;
        return 1;
    }
    if (b === null || b === undefined) return -1;
  
	// Handle same object reference
	if (a === b) return 0;


	// if a < b ==> a before b
	// if a > b ==> b before a
	// if a === b ==> no change
	const priorityA = SENTIMENT_PRIORITY[a.sentiment.toLowerCase() as keyof typeof SENTIMENT_PRIORITY];
	const priorityB = SENTIMENT_PRIORITY[b.sentiment.toLowerCase() as keyof typeof SENTIMENT_PRIORITY];


	if (priorityA !== priorityB) return priorityA - priorityB;

	// Handle identical scores
	if (a.score === b.score) {
		// Maintain original order for identical scores
		return a.text.localeCompare(b.text); // Fallback to text comparison
	}

	return b.score - a.score;
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

	const sortedResults = useMemo(() => {
		return [...results].sort(compareSentiments);
	  }, [results]);	  

	return (
		<Container maxWidth="md" sx={{ py: 4 }}>
			<Fade in timeout={800}>
				<Typography 
				variant="h3" 
				component="h1" 
				gutterBottom 
				sx={{ 
					fontWeight: 700,
					color: 'primary.main',
					textAlign: 'center',
					mb: 4
				}}
				>
				Sentiment Analysis
				</Typography>
			</Fade>

			<Slide in direction="down" timeout={500}>
				<Paper component="form" onSubmit={handleSubmit} sx={{ 
				p: 2,
				display: 'flex',
				gap: 2,
				borderRadius: '12px',
				boxShadow: 3
				}}>
				<TextField
					fullWidth
					variant="outlined"
					label="Enter text to analyze"
					value={inputText}
					onChange={(e) => setInputText(e.target.value)}
					sx={{
					'& .MuiOutlinedInput-root': {
						borderRadius: '8px'
					}
					}}
				/>
				<Zoom in={inputText.length > 0}>
					<Button 
					type="submit" 
					variant="contained" 
					size="large"
					sx={{
						borderRadius: '8px',
						px: 4,
						textTransform: 'none',
						fontWeight: 600
					}}
					>
					Analyze
					</Button>
				</Zoom>
				</Paper>
			</Slide>

			<List sx={{ mt: 4 }}>
				{sortedResults.map((result, index) => (
				<Zoom 
					key={index} 
					in 
					timeout={(index + 1) * 200}
					style={{ transitionDelay: `${index * 50}ms` }}
				>
					<SentimentItem>
					<ListItemText
						primary={result.text}
						secondary={
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<Chip
							label={result.sentiment}
							sx={{
								borderRadius: '6px',
								fontWeight: 600,
								backgroundColor: getSentimentColor(result.sentiment),
								color: 'white'
							}}
							/>
							<Typography variant="body2" color="textSecondary">
							Confidence: {result.score}%
							</Typography>
						</div>
						}
					/>
					</SentimentItem>
				</Zoom>
				))}
			</List>
    </Container>
	);
}

const getSentimentColor = (sentiment: string) => {
	switch(sentiment.toLowerCase()) {
	  case 'positive': return '#4CAF50';
	  case 'neutral': return '#9E9E9E';
	  case 'mixed': return '#FFC107';
	  case 'negative': return '#F44336';
	  default: return '#607D8B';
	}
  };  

export default App;
