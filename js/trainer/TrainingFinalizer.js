// js/trainer/TrainingFinalizer.js
import { backwardMergeSortedArrays } from './MemoryManager.js';
import { safeUpdateTelemetry } from './utils.js';
import { getMinTokenLength, getMaxTokenLength, getSmallL, getBigL } from '../Globals.js';
import { globalData } from '../Globals.js';

/**
 * Finalizes training by merging any remaining data in small arrays.
 */
export function finalizeTraining() {
    const minSequence = getMinTokenLength();
    const maxSequence = getMaxTokenLength();

    for (let seqLen = minSequence; seqLen <= maxSequence; seqLen++) {
        const arrayIndex = seqLen - minSequence;
        if (arrayIndex >= 0 &&
            arrayIndex < globalData.smallSortedArrays.length &&
            arrayIndex < globalData.bigSortedArrays.length) {
            const smallArray = globalData.smallSortedArrays[arrayIndex];
            const bigArray = globalData.bigSortedArrays[arrayIndex];
            if (smallArray && smallArray.size > 0) {
                try {
                    backwardMergeSortedArrays(smallArray, bigArray);
                } catch (error) {
                    throw error;
                }
            }
        }
    }

    // Final progress
    if (window.trainingProgress) {
        window.trainingProgress.tokensProcessed = window.trainingProgress.totalTokens;
        window.trainingProgress.percentage = 100;
    }

    // Telemetry: use MAX big array size
    const bigUsed = globalData.bigSortedArrays.length > 0
        ? Math.max(0, ...globalData.bigSortedArrays.map(arr => arr.size))
        : 0;

    safeUpdateTelemetry({
        trainingProgress: 100,
        tokenCount: window.trainingProgress?.totalTokens || 0,
        bigMemoryUsed: bigUsed,
        ramUsed: bigUsed
    });
}