// js/Globals.js

/**
 * TrainingStatus - Possible states of the training process
 */
export const TrainingStatus = {
    TRAINING: 'training',
    PAUSED: 'paused',
    STOPPED: 'stopped',
    INPUT_DEFINED: 'input defined'
};

// === Global State ===
export let status = TrainingStatus.STOPPED;
export let inputDefined = false;
export let droppedFiles = [];
export let tokenLength = 2;            
export let minTokenLength = 3;        
export let maxTokenLength = 12;
export let smallL = 1000;
export let bigL = 1_000_000;

// === Global Data (Model State) ===
export const globalData = {
    smallSortedArrays: [],
    bigSortedArrays: [],
    telemetry: {
        tokenCount: 0,
        uniqueTokens: 0,
        trainingProgress: 0,
        tempMemoryUsed: 0,
        tempMemoryTotal: 1000,
        bigMemoryUsed: 0,
        bigMemoryTotal: 1000000,
        ramUsed: 0,
        ramTotal: 2144
    }
};

// === Getters & Setters ===

export function setStatus(newStatus) {
    if (Object.values(TrainingStatus).includes(newStatus)) {
        status = newStatus;
    } else {
        throw new Error('Invalid training status: ' + newStatus);
    }
}

export function getStatus() { return status; }

export function setInputDefined(val) { inputDefined = !!val; }
export function getInputDefined() { return inputDefined; }

export function setDroppedFiles(files) { droppedFiles = files; }
export function getDroppedFiles() { return droppedFiles; }

export function setTokenLength(val) {
    const v = Math.min(12, Math.max(1, parseInt(val, 10) || 1));  // ← min now 1
    tokenLength = v;
}
export function getTokenLength() { return tokenLength; }

export function setMinTokenLength(val) {
    const v = Math.max(1, parseInt(val, 10) || 1);  // ← min is 1
    minTokenLength = v;
}
export function getMinTokenLength() { return minTokenLength; }

export function setMaxTokenLength(val) {
    const v = Math.max(1, parseInt(val, 10) || 1);
    maxTokenLength = v;
}
export function getMaxTokenLength() { return maxTokenLength; }

export function setSmallL(val) {
    const v = Math.max(100, parseInt(val, 10) || 100);
    smallL = v;
}
export function getSmallL() { return smallL; }

export function setBigL(val) {
    const v = Math.max(1000, parseInt(val, 10) || 1000);
    bigL = v;
}
export function getBigL() { return bigL; }

// === Debug ===
window.GLOBAL_DATA_DEBUG = globalData;