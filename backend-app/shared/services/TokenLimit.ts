interface TokenLimiterOptions {
  maxTokens?: number;
  reserveTokensForPrompt?: number;
  preserveStructure?: boolean;
  prioritySections?: string[];
  encoding?: 'approximate' | 'precise';
}

// Constants
const DEFAULT_MAX_TOKENS = 28000;
const DEFAULT_PROMPT_RESERVE = 2000;

// Core token estimation function
const estimateTokens = (text: string): number => {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const asciiText = text.replace(/[\u4e00-\u9fff]/g, '');
  const englishWords = asciiText.split(/\s+/).filter(word => word.length > 0).length;
  const specialChars = (asciiText.match(/[^\w\s]/g) || []).length;

  return Math.ceil(
    chineseChars * 1.0 + // Chinese chars
    englishWords * 1.3 + // English words
    specialChars * 0.5 + // Special chars
    text.length * 0.1, // Base character overhead
  );
};

// Calculate available tokens
const calculateAvailableTokens = (
  maxTokens: number = DEFAULT_MAX_TOKENS,
  reserveTokensForPrompt: number = DEFAULT_PROMPT_RESERVE,
): number => maxTokens - reserveTokensForPrompt;

// Check if text exceeds token limit
const exceedsTokenLimit = (text: string, availableTokens: number): boolean =>
  estimateTokens(text) > availableTokens;


// Utility function to check if text will exceed limit
export const willExceedLimit = (text: string, options: TokenLimiterOptions = {}): boolean => {
  const {
    maxTokens = DEFAULT_MAX_TOKENS,
    reserveTokensForPrompt = DEFAULT_PROMPT_RESERVE,
  } = options;

  const availableTokens = calculateAvailableTokens(maxTokens, reserveTokensForPrompt);
  return exceedsTokenLimit(text, availableTokens);
};
