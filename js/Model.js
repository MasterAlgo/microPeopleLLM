// Model.js module

// Token dictionary: maps n-grams to token IDs
let tokenDict = new Map();
// Reverse token dictionary: maps token IDs to n-grams
let reverseTokenDict = new Map();

export function setTokenDict(dict) {
    tokenDict = dict;
}

export function getTokenDict() {
    return tokenDict;
}

export function setReverseTokenDict(dict) {
    reverseTokenDict = dict;
}

export function getReverseTokenDict() {
    return reverseTokenDict;
} 