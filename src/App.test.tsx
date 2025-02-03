import App, { compareSentiments, SentimentResult  } from './App';

describe('compareSentiments', () => {
	const testData1: SentimentResult[] = [
		{ id: 1, text: 'A', sentiment: 'negative', score: 0.9 },
		{ id: 2, text: 'B', sentiment: 'positive', score: 0.8 },
		{ id: 3, text: 'C', sentiment: 'positive', score: 0.9 },
		{ id: 4, text: 'D', sentiment: 'neutral', score: 0.7 }
	];

	const testData2: (SentimentResult | null)[] = [
		{ id: 1, text: "A", sentiment: "positive", score: 95 },
		{ id: 2, text: "B", sentiment: "neutral", score: 80 },
		{ id: 3, text: "C", sentiment: "positive", score: 95 }, // Same score as A
		null,
	];

	describe('sorting algorithm', () => {

		test('sorts by sentiment priority (POSITIVE > NEUTRAL > MIXED > NEGATIVE)', () => {
			const sorted = testData1.slice().sort(compareSentiments);
			expect(sorted.map(r => r.text)).toEqual(['C', 'B', 'D', 'A']);
		});
	  
		test('sorts by score descending within same sentiment', () => {
			const positiveOnly = testData1.filter(r => r.sentiment === 'positive');
			const sorted = positiveOnly.slice().sort(compareSentiments);
			expect(sorted[0].score).toBeGreaterThan(sorted[1].score);
		});

		test('returns 0 for identical sentiment scores of the same sentiment', () => {
			const a = { id: 1, sentiment: 'neutral', score: 0.7, text: '' };
			const b = { id: 2, sentiment: 'neutral', score: 0.7, text: '' };
			expect(compareSentiments(a, b)).toBe(0);
		});

		test('sorts null values to the bottom', () => {
			const sorted = [...testData2].sort(compareSentiments);
			expect(sorted[sorted.length - 1]).toBeNull();
		});

		test('handles identical objects', () => {
			const a = testData2[0]!;
			expect(compareSentiments(a, a)).toBe(0);
		});
	});
});
