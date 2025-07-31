// js/Generator.js

// --- NEW: Function to get URL parameters ---
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const tokenLength = params.get('tokenLength');
    const minTokenLength = params.get('minTokenLength');
    const maxTokenLength = params.get('maxTokenLength');
    
    const result = {};
    if (tokenLength !== null) result.tokenLength = parseInt(tokenLength, 10);
    if (minTokenLength !== null) result.minTokenLength = parseInt(minTokenLength, 10);
    if (maxTokenLength !== null) result.maxTokenLength = parseInt(maxTokenLength, 10);
    
    console.log("URL Parameters parsed:", result);
    return result;
}
// Store the parameters globally or pass them around as needed
const urlParams = getUrlParams();
// --- END: Function to get URL parameters ---

// Import necessary data and functions from Globals and Tokenizer
// Note: We might override the value from Globals with the one from URL
import { globalData, getMaxTokenLength, getMinTokenLength, getTokenLength, setTokenLength } from './Globals.js';
import Tokenizer from './Tokenizer.js';

// --- Console Setup ---
const consoleOutput = document.getElementById('consoleOutput');
const originalConsoleLog = console.log;
console.log = function(...args) {
    originalConsoleLog.apply(console, args);
    const message = args.map(arg => {
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg, null, 2);
            } catch (e) {
                return String(arg);
            }
        }
        return String(arg);
    }).join(' ') + '\n';
    if (consoleOutput) {
        consoleOutput.value += message;
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
};
// --- End Console Setup ---

// --- NEW: Override Globals tokenLength if URL parameter exists ---
// Do this early, after imports and URL parsing
if (urlParams.tokenLength !== undefined && !isNaN(urlParams.tokenLength)) {
    console.log(`Overriding default tokenLength (${getTokenLength()}) with value from URL: ${urlParams.tokenLength}`);
    // Temporarily set the global value based on URL parameter
    // This ensures getTokenLength() returns the correct value for tokenizePrompt
    // WARNING: This modifies the global state in this Generator tab only.
    setTokenLength(urlParams.tokenLength);
    // Optionally, override min/max if passed, though they might not be needed for tokenization itself
    // You would need corresponding setMinTokenLength, setMaxTokenLength imports and calls if needed.
}
// --- END: Override Globals ---

const generateBtn = document.getElementById('generateBtn');
const promptInput = document.getElementById('promptInput');
const generationOutput = document.getElementById('generationOutput');
const candidatesOutput = document.getElementById('candidatesOutput');

let isGenerating = false;
let abortController = null;

// --- Updated tokenizePrompt function ---
function tokenizePrompt(prompt) {
    
console.log("tokenizePrompt received prompt:", JSON.stringify(prompt)); // JSON.stringify helps see spaces/newlines
//
//        
    // Now getTokenLength() should return the value passed from the Trainer UI via URL
    const tokenLength = getTokenLength();
    console.log(`Tokenizing prompt with token length: ${tokenLength}`);

    if (tokenLength <= 0) {
        console.error("Invalid token length:", tokenLength);
        return [];
    }

    const originalLength = prompt.length;
    const remainder = originalLength % tokenLength;
    let trimmedPrompt = prompt;

    if (remainder > 0) {
        const charsToTrim = remainder;
        trimmedPrompt = prompt.substring(charsToTrim);
        console.log(`Prompt trimmed: Removed first ${charsToTrim} chars. New length: ${trimmedPrompt.length}`);
    } else {
        console.log("Prompt length is already a multiple of token length, no trimming needed.");
    }

    const tokenizer = new Tokenizer(tokenLength); // This will now use the overridden value

    try {
        const tokens = tokenizer.tokenize(trimmedPrompt);
        console.log("Prompt tokenized successfully.");
        return tokens;
    } catch (error) {
        console.error("Error during prompt tokenization:", error);
        return [];
    }
}
// --- End tokenizePrompt function ---

// --- EMPTY HELPER METHODS ---
function adjustPrompt(prompt) { }
function findSortedArray(adjustedPrompt) { }
function findNearestNgram(biggestSortedArray, adjustedPrompt) { }
function createCandidatesArray(biggestSortedArray, nearestNgram, adjustedPrompt) { }
function findBestCandidate(candidatesArray) { }
function appendGenerationResult(bestNextTokenCandidate) { }
function updateAdjustedPrompt(adjustedPrompt, bestNextTokenCandidate) { }
function findNearestSimilarNgram(adjustedPrompt) { }
// --- END EMPTY HELPER METHODS ---

async function generate(prompt) {
    (async () => {
        abortController = new AbortController();
        const signal = abortController.signal;

        try {
            console.log("Starting generation process...");
            // Use URL params or fallback to Globals
            const minAllowedTokenLength = urlParams.minTokenLength ?? getMinTokenLength();
            const maxAllowedTokenLength = urlParams.maxTokenLength ?? getMaxTokenLength();
            console.log(`Min Token Length: ${minAllowedTokenLength}, Max Token Length: ${maxAllowedTokenLength}`);

            let promptTokens = tokenizePrompt(prompt);
            console.log("Tokenized prompt (IDs):", promptTokens);

            // Demonstration: Show token texts (requires detokenization)
            const tokenLength = getTokenLength(); // Should now be correct
            const demoTokenizer = new Tokenizer(tokenLength);
            // Note: Detokenizing individual IDs might require accessing internal dicts
            // which is complex. For now, just log IDs or placeholder.
            // A full detokenization example would need more integration.
            // Let's leave detailed text display for later.

            let adjustedPrompt = adjustPrompt(prompt);
            console.log("Adjusted prompt (placeholder):", adjustedPrompt);

            let counter = 0;
            while (!signal.aborted && counter < 0) {
                console.log(`--- Generation Loop Iteration ${counter + 1} ---`);
                let biggestSortedArray = findSortedArray(adjustedPrompt);
                console.log("Biggest Sorted Array (placeholder):", biggestSortedArray);
                let nearestNgram = findNearestNgram(biggestSortedArray, adjustedPrompt);
                console.log("Nearest Ngram (placeholder):", nearestNgram);
                let candidatesArray = createCandidatesArray(biggestSortedArray, nearestNgram, adjustedPrompt);
                console.log("Candidates Array (placeholder):", candidatesArray);
                let bestNextTokenCandidate = findBestCandidate(candidatesArray);
                console.log("Best Next Token Candidate (placeholder):", bestNextTokenCandidate);
                appendGenerationResult(bestNextTokenCandidate);
                adjustedPrompt = updateAdjustedPrompt(adjustedPrompt, bestNextTokenCandidate);
                console.log("Updated Adjusted Prompt (placeholder):", adjustedPrompt);

                counter++;
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            if (signal.aborted) {
                 console.log("Generation loop stopped by user.");
            } else if (counter >= 10) {
                 console.log("Generation loop limit reached (10 iterations).");
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                 console.error("Error during generation:", error);
            } else {
                 console.log("Generation loop aborted.");
            }
        } finally {
            isGenerating = false;
            if (generateBtn) {
                generateBtn.textContent = 'Generate';
                generateBtn.classList.remove('generating');
            }
            console.log("Generation process finished or stopped.");
        }
    })();
}

if (generateBtn) {
    generateBtn.addEventListener('click', () => {
        if (!isGenerating) {
            const prompt = promptInput.value.trim();
            if (!prompt) {
                alert("Please enter a prompt.");
                return;
            }

            if (consoleOutput) {
                consoleOutput.value = "--- New Generation Session ---\n";
            }

            isGenerating = true;
            generateBtn.textContent = 'Stop';
            generateBtn.classList.add('generating');

            generate(prompt);

        } else {
            console.log("Stop button clicked.");
            if (abortController) {
                abortController.abort();
            }
        }
    });
}

function stopGeneration() {
    console.log("stopGeneration function called.");
    if (abortController) {
        abortController.abort();
    }
    isGenerating = false;
    if (generateBtn) {
        generateBtn.textContent = 'Generate';
        generateBtn.classList.remove('generating');
    }
    console.log("Generation stopped (via stopGeneration function).");
}

window.addEventListener('beforeunload', () => {
    if (isGenerating) {
        stopGeneration();
    }
});