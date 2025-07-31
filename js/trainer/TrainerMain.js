// js/trainer/TrainerMain.js

import { trainFile } from './TrainingProcessor.js';
import { finalizeTraining } from './TrainingFinalizer.js';
import { initDictionaries } from './MemoryManager.js';
import { safeSetStatusBar, safeUpdateTelemetry } from './utils.js';
import { TrainingStatus, setStatus } from '../Globals.js';
import { getMinTokenLength, getMaxTokenLength, getSmallL, getBigL } from '../Globals.js';
import { tokenizeFile } from '../Tokenizer.js';

/**
 * Starts the training process on a list of files.
 * @param {File[]} files - Array of dropped-in .txt files
 */
export async function startTraining(files) {
    // Initialize progress tracker
    window.trainingProgress = {
        tokensProcessed: 0,
        totalTokens: 0,
        percentage: 0,
        currentFileIndex: -1,
        totalFiles: files.length,
        _cumulativeOffset: 0
    };

    // Estimate total tokens for progress bar
    let totalTokens = 0;
    for (let i = 0; i < files.length; i++) {
        try {
            const tokens = await tokenizeFile(files[i]);
            totalTokens += tokens.length;
        } catch (err) {
            console.warn(`Could not count tokens in ${files[i].name}`, err);
        }
    }
    window.trainingProgress.totalTokens = totalTokens;

    // Send initial telemetry
    safeUpdateTelemetry({
        tokenCount: 0,
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

            const tokens = await tokenizeFile(files[i]);
            await trainFile(tokens, i);

            // Check stop flag after file
            if (window.stopTrainingRequested) {
                safeSetStatusBar('Training stopped by user.', '#b71c1c');
                setStatus(TrainingStatus.STOPPED);
                return;
            }
        }

        finalizeTraining();
        safeSetStatusBar('✅ Training completed!', '#00796b');
    } catch (error) {
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