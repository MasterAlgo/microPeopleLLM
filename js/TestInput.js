// TestInput.js

// --- Import necessary functions to access global state ---
import { getTokenDict, getReverseTokenDict } from './Model.js';
import { getMinTokenLength, getMaxTokenLength } from './Globals.js';
import { globalData } from './Globals.js';

/**
 * Generates the content of the test input file as a string.
 * This allows the test to be self-contained without needing an external file.
 * @returns {string} The content of the test file.
 */
export function getTestFileContent() {
    // This is the content of the test_input.txt file we discussed
    // Note: If your actual file has \n or other chars, include them here for accurate testing.
    return `abcabcabcabcabcabcabcabcabcabcxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzabcabcabcabcabcabcabcabcabcabcxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzend`;
}

/**
 * Converts a token ID to its string representation with special character handling
 * @param {number} id - Token ID
 * @param {Map<number, string>} reverseTokenDict - Reverse token dictionary
 * @returns {string} String representation of the token
 */
function tokenIdToString(id, reverseTokenDict) {
    const str = reverseTokenDict.get(id);
    if (str === undefined) return `ID:${id}`;

    // Handle special characters
    return str
        .replace(/\r/g, '<CR>')
        .replace(/\n/g, '<LF>')
        .replace(/\t/g, '<TAB>')
        .replace(/ /g, '<SP>')
        .replace(/\0/g, '<NULL>');
}

/**
 * Formats a key array for display
 * @param {Array<number>} key - Array of token IDs
 * @param {Map<number, string>} reverseTokenDict - Reverse token dictionary
 * @returns {string} Formatted key string
 */
function formatKey(key, reverseTokenDict) {
    return key.map(id => tokenIdToString(id, reverseTokenDict)).join(',');
}

/**
 * Formats a value array for display
 * @param {Array<number>} value - Array of frequency values
 * @returns {string} Formatted value string
 */
function formatValue(value) {
    return value.join(',');
}

/**
 * Verifies the training results against expected values for the self-contained test input.
 * This function assumes overlapping tokenization (stride=1) and specific content.
 * It logs the full contents of the smallSortedArrays to the console.
 */
export function verifyTrainingResults() {
    try {
        console.log("--- Starting Self-Contained Training Results Verification ---");

        // --- 1. Get dictionaries for token ID lookup ---
        const tokenDict = getTokenDict();
        const reverseTokenDict = getReverseTokenDict();

        if (!tokenDict || !reverseTokenDict) {
            console.error("Verification failed: Could not access token dictionaries.");
            return;
        }

        console.log("Token Dictionary Size:", tokenDict.size);
        console.log("Reverse Token Dictionary Size:", reverseTokenDict.size);

        // --- 2. Find token IDs for key ngrams in our test file content ---
        // Based on overlapping tokenization with tokenLength=3 on the test content
        const tokenId_abc = tokenDict.get("abc");
        const tokenId_bca = tokenDict.get("bca");
        const tokenId_cab = tokenDict.get("cab");
        const tokenId_xyz = tokenDict.get("xyz");
        const tokenId_yzx = tokenDict.get("yzx");
        const tokenId_end = tokenDict.get("end");

        console.log("Expected Token IDs from test content (if present):");
        console.log("  'abc' ->", tokenId_abc);
        console.log("  'bca' ->", tokenId_bca);
        console.log("  'cab' ->", tokenId_cab);
        console.log("  'xyz' ->", tokenId_xyz);
        console.log("  'yzx' ->", tokenId_yzx);
        console.log("  'end' ->", tokenId_end);

        // --- 3. Access the trained SortedArrays ---
        const smallSortedArrays = globalData.smallSortedArrays;

        if (!smallSortedArrays || smallSortedArrays.length === 0) {
            console.error("Verification failed: Could not access smallSortedArrays or it's empty.");
            return;
        }

        // --- 4. Analyze results for each sequence length ---
        const minSequence = getMinTokenLength();
        const maxSequence = getMaxTokenLength();

        console.log(`Analyzing SortedArrays for sequence lengths ${minSequence} to ${maxSequence}...`);

        for (let seqLen = minSequence; seqLen <= maxSequence; seqLen++) {
            const arrayIndex = seqLen - minSequence;
            const sortedArray = smallSortedArrays[arrayIndex];

            if (!sortedArray) {
                console.warn(`  SortedArray for sequence length ${seqLen} not found.`);
                continue;
            }

            console.log(`  --- SortedArray for sequence length ${seqLen} ---`);
            console.log(`    Size: ${sortedArray.size}`);
            console.log(`    Capacity: ${sortedArray.L}`);
            console.log(`    Key Length (N): ${sortedArray.N}`);
            console.log(`    Value Length (K): ${sortedArray.K}`);

            if (sortedArray.N !== seqLen) {
                console.warn(`    WARNING: Key length (${sortedArray.N}) does not match expected sequence length (${seqLen}).`);
            }

            // --- Specific checks for known high-frequency sequences (if IDs were found) ---
            console.log(`    --- Specific Sequence Checks (if token IDs exist) ---`);
            if (tokenId_abc !== undefined && tokenId_bca !== undefined && tokenId_cab !== undefined &&
                tokenId_xyz !== undefined && tokenId_yzx !== undefined) {

                const checks = [];
                if (seqLen === 2) {
                    checks.push(
                        { key: [tokenId_abc, tokenId_bca], desc: "'abc','bca'" },
                        { key: [tokenId_bca, tokenId_cab], desc: "'bca','cab'" },
                        { key: [tokenId_cab, tokenId_abc], desc: "'cab','abc'" },
                        { key: [tokenId_xyz, tokenId_yzx], desc: "'xyz','yzx'" },
                        { key: [tokenId_yzx, tokenId_xyz], desc: "'yzx','xyz'" },
                        { key: [tokenId_cab, tokenId_xyz], desc: "'cab','xyz' (transition)" }
                    );
                } else if (seqLen === 3) {
                    checks.push(
                        { key: [tokenId_abc, tokenId_bca, tokenId_cab], desc: "'abc','bca','cab'" },
                        { key: [tokenId_xyz, tokenId_yzx, tokenId_xyz], desc: "'xyz','yzx','xyz'" },
                        { key: [tokenId_cab, tokenId_abc, tokenId_xyz], desc: "'cab','abc','xyz' (transition)" }
                    );
                } else if (seqLen === 4) {
                    checks.push(
                        { key: [tokenId_abc, tokenId_bca, tokenId_cab, tokenId_abc], desc: "'abc','bca','cab','abc'" },
                        { key: [tokenId_xyz, tokenId_yzx, tokenId_xyz, tokenId_yzx], desc: "'xyz','yzx','xyz','yzx'" }
                    );
                }

                checks.forEach(check => {
                    const index = sortedArray.findIndex(check.key);
                    if (index !== -1) {
                        const actualFreq = sortedArray.getValue(index)[0];
                        console.log(`    Found ${check.desc}: Frequency = ${actualFreq}`);
                    } else {
                        console.log(`    NOT Found ${check.desc}`);
                    }
                });
            } else {
                console.log(`    Skipping specific sequence checks due to missing token IDs.`);
            }

            // --- Full Content Dump: Print ALL entries in formatted way ---
            console.log(`    --- Full Content Dump (All ${sortedArray.size} entries) ---`);
            if (sortedArray.size > 0) {
                for (let i = 0; i < sortedArray.size; i++) {
                    const key = Array.from(sortedArray.getKey(i));
                    const value = Array.from(sortedArray.getValue(i));

                    const keyStr = formatKey(key, reverseTokenDict);
                    const valueStr = formatValue(value);

                    console.log(`      [${keyStr}][${valueStr}]`);
                }
            } else {
                console.log(`    No entries found in this SortedArray.`);
            }
        }

        console.log("--- Self-Contained Verification Complete ---");
        console.log("The results above show the full contents of the smallSortedArrays.");
        console.log("Inspect the dumps to verify all expected sequences and frequencies are present.");

    } catch (error) {
        console.error("Error during self-contained verification:", error);
    }
}