// js/ui/controls-panel.js

import {
    // Status and input
    setStatus,
    setInputDefined,
    getDroppedFiles,
    // Config setters
    setTokenLength,
    setMinTokenLength,
    setMaxTokenLength,
    setSmallL,
    setBigL
} from '../Globals.js';
import { TrainingStatus } from '../Globals.js';
import { startTraining } from '../trainer/TrainerMain.js';

/**
 * Creates the Controls Panel with:
 * - Config inputs (token size, memory)
 * - Start/Stop button
 * - Status bar
 * - Integration with Trainer.js
 *
 * Note: 
 *   - "Token Size" defines how tokens are split (e.g., char-level vs word-level).
 *   - "Min/Max Nodes Synapses" define the range of n-gram lengths (i.e., how many 
 *     consecutive tokens are linked via synapses in the network).
 */
export function createControlsPanel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`[ControlsPanel] Container #${containerId} not found`);
        return;
    }

    // Render UI
    container.innerHTML = `
        <div class="controls-grid">
            <!-- Row 1: Token & Synapse Controls -->
            <div class="field">
                <label for="token-size">Token Size</label>
                <input 
                    type="number" 
                    id="token-size" 
                    value="2"
                    min="1"
                    max="12" 
                    data-config="tokenSize" />
            </div>

            <div class="field">
                <label for="min-synapses">Min Neuron's Synapses</label>
                <input 
                    type="number" 
                    id="min-synapses" 
                    value="3" 
                    min="1" 
                    step="1" 
                    data-config="minSynapses" />
            </div>

            <div class="field">
                <label for="max-synapses">Max Neuron's Synapses</label>
                <input 
                    type="number" 
                    id="max-synapses" 
                    value="12" 
                    min="1" 
                    step="1" 
                    data-config="maxSynapses" />
            </div>

            <!-- Row 2: Memory Controls -->
            <div class="field">
                <label for="temp-memory">Temp Memory (L)</label>
                <input 
                    type="number" 
                    id="temp-memory" 
                    value="1000" 
                    min="100" 
                    step="100" 
                    data-config="tempMemory" />
            </div>

            <div class="field">
                <label for="big-memory">Big Memory (L)</label>
                <input 
                    type="number" 
                    id="big-memory" 
                    value="1000000" 
                    min="10000" 
                    step="10000" 
                    data-config="bigMemory" />
            </div>

            <div class="field action-field">
                <label>&nbsp;</label>
                <button id="toggle-training" class="btn">Start</button>
            </div>

            <!-- Row 3: Status Bar -->
            <div class="field status-field">
                <label>Status</label>
                <div id="status-bar" class="status-bar" aria-live="polite">Waiting for files...</div>
            </div>
        </div>
    `;

    // Elements
    const tokenSizeInput = container.querySelector('#token-size');
    const minSynapsesInput = container.querySelector('#min-synapses');
    const maxSynapsesInput = container.querySelector('#max-synapses');  // Fixed ID selector
    const tempMemoryInput = container.querySelector('#temp-memory');
    const bigMemoryInput = container.querySelector('#big-memory');
    const startStopButton = document.getElementById('toggle-training');
    const statusBar = document.getElementById('status-bar');

    // --- Set Up window.setStatusBar for Trainer.js ---
    function setStatusBar(msg, color) {
        statusBar.textContent = msg;
        statusBar.style.color = color || '#333';
        statusBar.style.fontWeight = '500';
    }

    // Make globally available
    window.setStatusBar = setStatusBar;

    // --- Sync Inputs with Globals ---
    tokenSizeInput.value = 2;
    minSynapsesInput.value = 3;
    maxSynapsesInput.value = 12;
    tempMemoryInput.value = 1000;
    bigMemoryInput.value = 1_000_000;

    // Update global state on input
    tokenSizeInput.addEventListener('input', e => setTokenLength(e.target.value));
    minSynapsesInput.addEventListener('input', e => setMinTokenLength(e.target.value));
    maxSynapsesInput.addEventListener('input', e => setMaxTokenLength(e.target.value));
    tempMemoryInput.addEventListener('input', e => setSmallL(e.target.value));
    bigMemoryInput.addEventListener('input', e => setBigL(e.target.value));

    // --- Training State ---
    let isTraining = false;
    let areControlsLocked = false;

    // --- Lock Controls After Training Starts ---
    function lockControls() {
        if (areControlsLocked) return;

        tokenSizeInput.disabled = true;
        minSynapsesInput.disabled = true;
        maxSynapsesInput.disabled = true;
        tempMemoryInput.disabled = true;
        bigMemoryInput.disabled = true;

        // Visual feedback
        [
            tokenSizeInput,
            minSynapsesInput,
            maxSynapsesInput,
            tempMemoryInput,
            bigMemoryInput
        ].forEach(input => {
            input.style.backgroundColor = '#f5f5f5';
            input.style.opacity = '0.8';
        });

        areControlsLocked = true;
    }

    // --- Start/Stop Button Logic ---
    startStopButton.addEventListener('click', async () => {
        if (isTraining) {
            // Stop Training
            window.stopTrainingRequested = true;
            startStopButton.disabled = true;
            startStopButton.textContent = 'Stopping...';
            setStatusBar('🛑 Stop requested...', '#b71c1c');
        } else {
            // Start Training
            const files = getDroppedFiles();
            if (!files || files.length === 0) {
                setStatusBar('⚠️ No files dropped. Please add files in the DnD panel.', '#ff6d00');
                return;
            }

            // Lock controls on first start
            if (!areControlsLocked) {
                lockControls();
            }

            isTraining = true;
            startStopButton.textContent = 'Stop';
            setStatus(TrainingStatus.TRAINING);
            setStatusBar('▶️ Training started...', '#00796b');

            // Reset stop flag
            window.stopTrainingRequested = false;

            try {
                await startTraining(files);
                if (!window.stopTrainingRequested) {
                    setStatusBar('✅ Training completed!', '#00796b');
                }
            } catch (err) {
                console.error('Training failed:', err);
                setStatusBar('❌ Error: ' + (err.message || 'Unknown error'), '#b71c1c');
            } finally {
                isTraining = false;
                startStopButton.textContent = 'Start';
                startStopButton.disabled = false;
                setStatus(TrainingStatus.STOPPED);
                window.stopTrainingRequested = false;
            }
        }
    });
}