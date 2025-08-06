// Tokenizer.js module

import { getTokenLength } from './Globals.js';
import { getTokenDict, setTokenDict, getReverseTokenDict, setReverseTokenDict } from './Model.js';

/**
 * N-Character Tokenizer with Dictionaries
 * Maps N-character sequences to token IDs
 */
class Tokenizer {
    constructor(n) {
        if (typeof n === 'undefined') {
            n = getTokenLength();
        }
        this.n = n;
        // Use shared dictionaries from Model.js
        this.specialTokens = {
            PAD: '\u25A1', // White square as padding
            UNK: '\uFFFD'  // Replacement character for unknown
        };
    }

    tokenize(text) {
        let dict        = getTokenDict();
        let reverseDict = getReverseTokenDict();
        let nextTokenId = dict.size;
        let tokenLength = getTokenLength();
        // For n=1, treat each character as a token (like old Tokenizer_char)
        if (this.n === 1) {
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                if (!dict.has(char)) {
                    dict.set(char, nextTokenId);
                    reverseDict.set(nextTokenId, char);
                    nextTokenId++;
                }
            }
            setTokenDict(dict);
            setReverseTokenDict(reverseDict);
            return Array.from(text).map(char => dict.get(char));
        }
        // n > 1: N-gram tokenization with NON-OVERLAPPING chunks
        const processedText = this.preprocessText(text);
        // Build dictionary from all N-char sequences (non-overlapping)
        for (let i = 0; i <= processedText.length - this.n; i += this.n) {  // Changed: i += this.n
            const ngram = processedText.substring(i, i + this.n);
            if (!dict.has(ngram)) {
                dict.set(ngram, nextTokenId);
                reverseDict.set(nextTokenId, ngram);
                nextTokenId++;
            }
        }
        setTokenDict(dict);
        setReverseTokenDict(reverseDict);
        // Convert text to tokens (non-overlapping)
        const tokens = [];
        for (let i = 0; i <= processedText.length - this.n; i += this.n) {  // Changed: i += this.n
            const ngram = processedText.substring(i, i + this.n);
            tokens.push(dict.get(ngram));
//            for (let j = 1; j < tokenLength ; j++) {                            // to collect tokens starting from i + 1
//                const ngram2 = processedText.substring(i + j, i + j + this.n);
//                tokens.push(dict.get(ngram2));
//            }
        }
        return tokens;
    }

    preprocessText(text) {
        // For n=1, no padding needed
        if (this.n === 1) return text;
        // n > 1: pad to fit N-size chunks
        let processed = text;
        const remainder = processed.length % this.n;
        if (remainder > 0) {
            const paddingNeeded = this.n - remainder;
            processed += this.specialTokens.PAD.repeat(paddingNeeded);
        }
        return processed;
    }

    detokenize(tokens) {
        let reverseDict = getReverseTokenDict();
        // For n=1, map token IDs back to characters
        if (this.n === 1) {
            return tokens.map(id => reverseDict.get(id) || this.specialTokens.UNK).join('');
        }
        // n > 1: map token IDs back to n-grams and join
        const ngrams = tokens.map(id => reverseDict.get(id) || this.specialTokens.UNK);
        let result = ngrams.join('');
        // Remove padding tokens
        result = result.replace(new RegExp(this.specialTokens.PAD, 'g'), '');
        return result;
    }

    getVocabSize() {
        let dict = getTokenDict();
        return dict.size;
    }
}

export default Tokenizer;

/**
 * Tokenizes a file using the current token length.
 * @param {File} file - The file to tokenize
 */
export async function tokenizeFile(file, stepInsideToken) {
    const tokenLength = getTokenLength();
    const tokenizer = new Tokenizer(tokenLength);
    // Read file as text
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const text                  = e.target.result;
            const removedFirstCharsText = text.slice(stepInsideToken);
            const tokens = tokenizer.tokenize(removedFirstCharsText);
//            for (let j = 1; j < tokenLength ; j++) {
//                const slisedText = text.slice(1);
//                const tokens = tokenizer.tokenize(text);
//            }
            resolve(tokens);
        };
        reader.onerror = function (err) {
            reject(err);
        };
        reader.readAsText(file);
    });
}