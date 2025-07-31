// js/trainer/MemoryManager.js
import { SortedArray } from '../SortedArray.js';
import { getMinTokenLength, getMaxTokenLength, getSmallL, getBigL } from '../Globals.js';
import { globalData } from '../Globals.js';
import { safeSetStatusBar } from './utils.js';
import { TrainingStatus, setStatus } from '../Globals.js';

/**
 * Initializes dictionaries for training.
 */
export function initDictionaries() {
    if (globalData.smallSortedArrays.length > 0 || globalData.bigSortedArrays.length > 0) {
        return;
    }
    const minSequence = getMinTokenLength();
    const maxSequence = getMaxTokenLength();
    const smallL = getSmallL();
    const bigL = getBigL();
    for (let i = minSequence; i <= maxSequence; i++) {
        globalData.smallSortedArrays.push(new SortedArray(smallL, i, 2));
        globalData.bigSortedArrays.push(new SortedArray(bigL, i, 2));
    }
}

/**
 * Backward merge implementation for SortedArray instances
 * Merges smallArray into largeArray from the end backwards
 * @param {SortedArray} smallArray - smaller sorted array to merge from
 * @param {SortedArray} largeArray - larger sorted array to merge into
 */
export function backwardMergeSortedArrays(smallArray, bigArray) {
    // Verify compatibility
    if (smallArray.N !== bigArray.N || smallArray.K !== bigArray.K) {
        throw new Error('Cannot merge arrays with different key/value lengths');
    }
    // Check capacity before merging
    if (bigArray.size + smallArray.size > bigArray.L) {
        const errorMsg = 'RAM capacity exhausted, Training stopped.';
        safeSetStatusBar(errorMsg, '#b71c1c');
        setStatus(TrainingStatus.STOPPED);
        alert(`${errorMsg}
Key Length: ${bigArray.N}
Training cannot continue and will stop.`);
        throw new Error(`RAM capacity exhausted for key length ${bigArray.N}. Training stopped.`);
    }
    let i = bigArray.size - 1;
    let j = smallArray.size - 1;
    let k = bigArray.size + smallArray.size - 1;
    while (i >= 0 && j >= 0) {
        const keyI = bigArray.getKey(i);
        const keyJ = smallArray.getKey(j);
        let comparison = 0;
        for (let idx = 0; idx < bigArray.N; idx++) {
            if (keyI[idx] !== keyJ[idx]) {
                comparison = keyI[idx] - keyJ[idx];
                break;
            }
        }
        if (comparison >= 0) {
            const srcBase = i * bigArray.stride;
            const dstBase = k * bigArray.stride;
            for (let idx = 0; idx < bigArray.stride; idx++) {
                bigArray.data[dstBase + idx] = bigArray.data[srcBase + idx];
            }
            i--;
        } else {
            const srcBase = j * smallArray.stride;
            const dstBase = k * bigArray.stride;
            for (let idx = 0; idx < smallArray.stride; idx++) {
                bigArray.data[dstBase + idx] = smallArray.data[srcBase + idx];
            }
            j--;
        }
        k--;
    }
    while (j >= 0) {
        const srcBase = j * smallArray.stride;
        const dstBase = k * bigArray.stride;
        for (let idx = 0; idx < smallArray.stride; idx++) {
            bigArray.data[dstBase + idx] = smallArray.data[srcBase + idx];
        }
        j--;
        k--;
    }
    bigArray.size += smallArray.size;
    smallArray.clear();
}