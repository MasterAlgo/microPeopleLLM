// js/trainer/TrainerMain.js

import { trainFile } from './TrainingProcessor.js';
import { finalizeTraining } from './TrainingFinalizer.js';
import { initDictionaries } from './MemoryManager.js';
import { safeSetStatusBar, safeUpdateTelemetry } from './utils.js';
import { TrainingStatus, setStatus } from '../Globals.js';
import { globalData} from "../Globals.js";
import { tokenLength, getMinTokenLength, getMaxTokenLength, getSmallL, getBigL } from '../Globals.js';
import { tokenizeFile } from '../Tokenizer.js';
import { getTokenDict } from '../Model.js';

/**
 * Starts the training process on a list of files.
 * @param {File[]} files - Array of dropped-in .txt files
 */
export async function startTraining(files) {
    // Initialize progress tracker
    window.trainingProgress = {
        tokensProcessed: 0,
        totalTokens: 0,
        uniqueTokens: 0,
        percentage: 0,
        currentFileIndex: -1,
        totalFiles: files.length,
        _cumulativeOffset: 0
    };

    // Estimate total tokens for progress bar
    let totalTokens = 0;
    let uniqueTokens = 0;
    for (let i = 0; i < files.length; i++) {
        try {
            for( let j = 0; j < tokenLength; j++){
                const tokens = await tokenizeFile(files[i], j);
                totalTokens += tokens.length;
                uniqueTokens = getTokenDict().size;
            }
//console.log(`TrainerMain: uniqueTokens in ${uniqueTokens}`);
        } catch (err) {
            console.warn(`Could not count tokens in ${files[i].name}`, err);
        }
    }
    window.trainingProgress.totalTokens = totalTokens;
    window.trainingProgress.uniqueTokens = uniqueTokens;

    // Send initial telemetry
    safeUpdateTelemetry({
        tokenCount: 0,
        uniqueTokens: getTokenDict().size,
        trainingProgress: 0,
        tempMemoryUsed: 0,
        tempMemoryTotal: getSmallL(),
        bigMemoryUsed: 0,
        bigMemoryTotal: getBigL(),
        ramUsed: 0,
        ramTotal: getBigL()
    });

    // Start training
    initDictionaries();

    try {
        for (let i = 0; i < files.length; i++) {
            window.trainingProgress.currentFileIndex = i;

            // Check stop flag before processing file
            if (window.stopTrainingRequested) {
                safeSetStatusBar('Training stopped by user.', '#b71c1c');
                setStatus(TrainingStatus.STOPPED);
                return;
            }
for(let j = 0; j < tokenLength; j++){
            const tokens = await tokenizeFile(files[i], j);
//console.log(`TrainerMain: befor Training file : uniqueTokens in ${uniqueTokens}`);
//window.trainingProgress.uniqueTokens = uniqueTokens;
//let uniqueTokens = 0;
            globalData.telemetry.uniqueTokens = getTokenDict().size;;
            await trainFile(tokens, i);
}
            // Check stop flag after file
            if (window.stopTrainingRequested) {
                safeSetStatusBar('Training stopped by user.', '#b71c1c');
                setStatus(TrainingStatus.STOPPED);
                return;
            }
        }

        finalizeTraining();
        safeSetStatusBar('✅ Training completed!', '#00796b');
// ------------------ print topology -----------------------------    
        let topology = "";
        const minSequence = getMinTokenLength();
        const maxSequence = getMaxTokenLength();
        for (let seqLen = minSequence; seqLen <= maxSequence; seqLen++) {
            const arrayIndex = seqLen - minSequence;
            const bigArray   = globalData.bigSortedArrays[arrayIndex];
            const size       = bigArray.size;
            topology += ` ${size} `;
        }
        console.log(`TrainerMain: Topology layers = ${topology}`);
// ------------------ print topology -----------------------------        
    } 
    catch (error) {
        const statusText = document.querySelector('#status-bar')?.textContent || '';
        if (!statusText.includes('RAM capacity exhausted')) {
            safeSetStatusBar('Training stopped due to an error.', '#b71c1c');
        }
        setStatus(TrainingStatus.STOPPED);
        throw error;
    } finally {
        window.stopTrainingRequested = false;
    }
}

