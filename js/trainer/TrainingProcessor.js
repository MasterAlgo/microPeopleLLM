// js/trainer/TrainingProcessor.js
import { backwardMergeSortedArrays } from './MemoryManager.js';
import { safeUpdateTelemetry } from './utils.js';
import { getMinTokenLength, getMaxTokenLength, getSmallL, getBigL } from '../Globals.js';
import { globalData } from '../Globals.js';
import { tokenizeFile } from '../Tokenizer.js';
import { getTokenDict } from '../Model.js';

import Tokenizer from '../Tokenizer.js';

/**
 * Trains on a tokenized file by counting n-gram sequences.
 * This version is chunked and reports progress.
 * @param {Int32Array|Array<number>} tokens - Tokenized input data
 * @param {number} fileIndex - Index of the file being processed
 * @returns {Promise<void>} Resolves when training is complete for this file
 */
export function trainFile(tokens, fileIndex) {
    return new Promise((resolve, reject) => {
        const minSequence = getMinTokenLength();
        const maxSequence = getMaxTokenLength();
        const totalTokens = tokens.length;
        if (totalTokens < minSequence) {
            resolve();
            return;
        }
        let i = 0;
        const yieldIntervalMs = 50;
        let lastYieldTime = performance.now();

        function processChunk() {
            if (window.stopTrainingRequested) {
                resolve();
                return;
            }

// ✅ Create a detokenizer instance here
const detokenizer = new Tokenizer(); // Uses getTokenLength() internally if n not passed

            let shouldYield = false;
            while (i <= totalTokens - minSequence && !shouldYield) {
                if (window.stopTrainingRequested) {
                    resolve();
                    return;
                }

                for (let seqLen = minSequence; seqLen <= maxSequence && i + seqLen <= totalTokens; seqLen++) {
                    const key = tokens.slice(i, i + seqLen);
const text = detokenizer.detokenize(key);        
//console.info('== Training Processor key, text :', Array.from(key), text);    

                    const arrayIndex = seqLen - minSequence;
                    if (arrayIndex >= 0 && arrayIndex < globalData.smallSortedArrays.length) {
                        const smallArray = globalData.smallSortedArrays[arrayIndex];
                        const bigArray = globalData.bigSortedArrays[arrayIndex];

                        if (!smallArray.findAndIncrement(key, 1)) {
                            if (!smallArray.isFull()) {
                                const insertSuccess = smallArray.insert(key, [1, 0]);
                                if (!insertSuccess) {
                                    reject(new Error(`Insertion failed for key length ${seqLen}`));
                                    return;
                                }
                            } else {
                                try {
                                    backwardMergeSortedArrays(smallArray, bigArray);
                                } catch (mergeError) {
                                    reject(mergeError);
                                    return;
                                }
                                const insertSuccess = smallArray.insert(key, [1, 0]);
                                if (!insertSuccess) {
                                    reject(new Error(`Unexpected insertion failure after merge for key length ${seqLen}`));
                                    return;
                                }
                            }
                        }
                    }
                }

                i++;
                if (performance.now() - lastYieldTime >= yieldIntervalMs) {
                    shouldYield = true;
                }
            }

            // Update progress
            if (window.trainingProgress) {
                window.trainingProgress.tokensProcessed = window.trainingProgress._cumulativeOffset + i;
                if (window.trainingProgress.totalTokens > 0) {
                    window.trainingProgress.percentage = Math.min(
                        100,
                        Math.round((window.trainingProgress.tokensProcessed / window.trainingProgress.totalTokens) * 100)
                    );
                }
            }

            // Telemetry: use MAX size across arrays (not sum)
            const tempUsed = globalData.smallSortedArrays.length > 0
                ? Math.max(0, ...globalData.smallSortedArrays.map(arr => arr.size))
                : 0;

            const bigUsed = globalData.bigSortedArrays.length > 0
                ? Math.max(0, ...globalData.bigSortedArrays.map(arr => arr.size))
                : 0;

            safeUpdateTelemetry({
                tokenCount: window.trainingProgress?.tokensProcessed || 0,
                uniqueTokens: getTokenDict().size,
                trainingProgress: window.trainingProgress?.percentage || 0,
                tempMemoryUsed: tempUsed,
                tempMemoryTotal: getSmallL(),
                bigMemoryUsed: bigUsed,
                bigMemoryTotal: getBigL(),
                ramUsed: bigUsed,
                ramTotal: getBigL()
            });

            if (i > totalTokens - minSequence) {
                if (window.trainingProgress) {
                    window.trainingProgress._cumulativeOffset += totalTokens;
                }
                resolve();
            } else {
                lastYieldTime = performance.now();
                setTimeout(processChunk, 0);
            }
        }

        processChunk();
    });
}