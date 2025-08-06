// Telemetry JS module (js/telemetry.js)
import { getTokenDict } from './Model.js';
import { globalData } from './Globals.js'; // Import globalData to access SortedArrays

(function () {
    // TELEMETRY PANEL (existing code)
    const root = document.getElementById('telemetry-root');
    if (!root) return;

    // Create slider and label
    const sliderLabel = document.createElement('label');
    sliderLabel.textContent = 'Refresh delay: ';
    sliderLabel.style.marginRight = '8px';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '1';
    slider.max = '10';
    slider.value = '3';
    slider.style.verticalAlign = 'middle';
    slider.style.marginRight = '8px';

    const sliderValue = document.createElement('span');
    sliderValue.textContent = slider.value + 's';
    sliderValue.style.marginRight = '16px';

    // Create clock
    const clock = document.createElement('span');
    clock.style.fontFamily = 'monospace';
    clock.style.marginLeft = '16px';

    // Row for slider and clock
    const topRow = document.createElement('div');
    topRow.style.display = 'flex';
    topRow.style.alignItems = 'center';
    topRow.appendChild(sliderLabel);
    topRow.appendChild(slider);
    topRow.appendChild(sliderValue);
    topRow.appendChild(clock);

    // --- NEW: Overall Training Progress Bar ---
    const overallProgressWrapper = document.createElement('div');
    overallProgressWrapper.style.margin = '12px 0';

    const overallProgressLabel = document.createElement('div');
    overallProgressLabel.textContent = 'Overall Training Progress';
    overallProgressLabel.style.marginBottom = '2px';

    const overallProgressBar = document.createElement('progress');
    overallProgressBar.value = 0;
    overallProgressBar.max = 100;
    overallProgressBar.style.width = '100%';

    const overallProgressDetails = document.createElement('div');
    overallProgressDetails.className = 'details';
    overallProgressDetails.style.fontSize = '0.85em';
    overallProgressDetails.style.color = '#555';
    overallProgressDetails.style.marginTop = '2px';
    overallProgressDetails.textContent = '0% (0/0 tokens)';

    overallProgressWrapper.appendChild(overallProgressLabel);
    overallProgressWrapper.appendChild(overallProgressBar);
    overallProgressWrapper.appendChild(overallProgressDetails);
    // --- END: Overall Training Progress Bar ---

    // Progress bar helper (kept for new bars)
    function createProgressBar(labelText, value, max) {
        const wrapper = document.createElement('div');
        wrapper.style.margin = '12px 0';
        const label = document.createElement('div');
        label.textContent = labelText;
        label.style.marginBottom = '2px';
        const bar = document.createElement('progress');
        bar.value = value;
        bar.max = max;
        bar.style.width = '100%';
        wrapper.appendChild(label);
        wrapper.appendChild(bar);
        return wrapper;
    }

    // NEW PROGRESS BARS (Small and Big Arrays)
    const smallArrayBar = createProgressBar('Max Small Array Fill', 0, 100);
    const bigArrayBar = createProgressBar('Total Nodes Created', 0, 100); // Max will be updated dynamically

    // Label for tokens dictionary size AND RAM usage
    const infoLabel = document.createElement('div');
    infoLabel.style.margin = '8px 0';
    infoLabel.style.fontWeight = 'bold';

    function updateInfoLabel() {
        const dict = getTokenDict();
        const dictSize = dict.size || 0;
        let ramInfo = "RAM usage: N/A";
        // Try to get memory information (Chromium only)
        if (performance.memory) {
            const usedMB = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
            const totalMB = Math.round(performance.memory.jsHeapSizeLimit / (1024 * 1024));
            const availableMB = totalMB - usedMB; // Calculate available RAM
            ramInfo = `RAM: ~${usedMB} MB / ~${totalMB} MB (Available: ~${availableMB} MB)`; // Add available
        }
        infoLabel.textContent = `Tokens Dictionary Size: ${dictSize} | ${ramInfo}`;
    }
    updateInfoLabel(); // Initial call

    // Function to calculate telemetry data (for small/big arrays)
    function calculateTelemetry() {
        const telemetry = {
            maxSmallArrayFill: 0,
            totalNodesCreated: 0,
            maxSmallArrayKeyLength: 0,
            bigArrayInfo: { totalSize: 0, totalCapacity: 0 }
        };

        // --- Metric 1: Max Small Array Fill Progress ---
        let maxFillRatio = 0;
        let maxFillKeyLength = 0;
        if (globalData.smallSortedArrays && globalData.smallSortedArrays.length > 0) {
            for (let i = 0; i < globalData.smallSortedArrays.length; i++) {
                const smallArray = globalData.smallSortedArrays[i];
                if (smallArray && smallArray.L > 0) {
                    const fillRatio = smallArray.size / smallArray.L;
                    if (fillRatio > maxFillRatio) {
                        maxFillRatio = fillRatio;
                        maxFillKeyLength = smallArray.N;
                    }
                }
            }
        }
        telemetry.maxSmallArrayFill = Math.round(maxFillRatio * 100);
        telemetry.maxSmallArrayKeyLength = maxFillKeyLength;

        // --- Metric 2: Total Nodes Created ---
        let totalBigSize = 0;
        let totalBigCapacity = 0;
        if (globalData.bigSortedArrays && globalData.bigSortedArrays.length > 0) {
            for (let i = 0; i < globalData.bigSortedArrays.length; i++) {
                const bigArray = globalData.bigSortedArrays[i];
                if (bigArray) {
                    totalBigSize += bigArray.size;
                    totalBigCapacity += bigArray.L;
                }
            }
        }
        telemetry.totalNodesCreated = totalBigSize;
        telemetry.bigArrayInfo = {
            totalSize: totalBigSize,
            totalCapacity: totalBigCapacity
        };
        return telemetry;
    }

    // Function to update ALL progress bars and labels
    function updateProgressBars() {
        // --- NEW: Update Overall Training Progress Bar ---
        let overallProgressPercent = 0;
        let overallProgressText = '0% (0/0 tokens)';
        if (window.trainingProgress) {
            overallProgressPercent = window.trainingProgress.percentage || 0;
            const processed = window.trainingProgress.tokensProcessed?.toLocaleString() || '0';
            const total = window.trainingProgress.totalTokens?.toLocaleString() || '0';
            overallProgressText = `${overallProgressPercent}% (${processed}/${total} tokens)`;
            // Optional: Add file info
            // const currentFile = window.trainingProgress.currentFileIndex >= 0 ? window.trainingProgress.currentFileIndex + 1 : 0;
            // const totalFiles = window.trainingProgress.totalFiles || 0;
            // overallProgressText += ` - File ${currentFile}/${totalFiles}`;
        }
        overallProgressBar.value = overallProgressPercent;
        overallProgressBar.max = 100;
        overallProgressDetails.textContent = overallProgressText;
        // --- END: Update Overall Training Progress Bar ---

        // --- Update Small and Big Array Progress Bars ---
        const telemetry = calculateTelemetry();

        // Update Info Label (includes RAM)
        updateInfoLabel();

        // --- Modified Max Small Array Fill Bar ---
        const smallArrayLabel = `Max Small Array Fill (Key Length: ${telemetry.maxSmallArrayKeyLength || 'N/A'})`;
        smallArrayBar.querySelector('div').textContent = smallArrayLabel;
        smallArrayBar.querySelector('progress').value = telemetry.maxSmallArrayFill;
        smallArrayBar.querySelector('progress').max = 100;

        let smallArrayDetails = smallArrayBar.querySelector('.details');
        if (!smallArrayDetails) {
            smallArrayDetails = document.createElement('div');
            smallArrayDetails.className = 'details';
            smallArrayDetails.style.fontSize = '0.85em';
            smallArrayDetails.style.color = '#555';
            smallArrayDetails.style.marginTop = '2px';
            // Insert after the progress bar
            smallArrayBar.insertBefore(smallArrayDetails, smallArrayBar.querySelector('progress').nextSibling);
        }
        const sizeInfo = globalData.smallSortedArrays.find(sa => sa && sa.N === telemetry.maxSmallArrayKeyLength);
        const currentSize = sizeInfo ? sizeInfo.size : 0;
        const capacity = sizeInfo ? sizeInfo.L : 0;
        smallArrayDetails.textContent = `${telemetry.maxSmallArrayFill}% (${currentSize}/${capacity})`;

        // --- Modified Big Array Bar: Show Total Nodes Created ---
        const bigArrayLabel = `Total Nodes Created`;
        bigArrayBar.querySelector('div').textContent = bigArrayLabel;

        const nodesCreated = telemetry.totalNodesCreated;
        const FIXED_PROGRESS_MAX = 5000000; // Example: 5 million nodes
        const progressBarMax = FIXED_PROGRESS_MAX;
        const progressBarValue = Math.min(nodesCreated, progressBarMax);
        bigArrayBar.querySelector('progress').value = progressBarValue;
        bigArrayBar.querySelector('progress').max = progressBarMax;

        let bigArrayDetails = bigArrayBar.querySelector('.details');
        if (!bigArrayDetails) {
            bigArrayDetails = document.createElement('div');
            bigArrayDetails.className = 'details';
            bigArrayDetails.style.fontSize = '0.85em';
            bigArrayDetails.style.color = '#555';
            bigArrayDetails.style.marginTop = '2px';
            // Insert after the progress bar
            bigArrayBar.insertBefore(bigArrayDetails, bigArrayBar.querySelector('progress').nextSibling);
        }
        const theoreticalCapacity = telemetry.bigArrayInfo.totalCapacity.toLocaleString();
        bigArrayDetails.textContent = `${nodesCreated.toLocaleString()} nodes (Capacity: ${theoreticalCapacity})`;
        // --- End of Small/Big Array Updates ---
    }


    // Render all elements in order
    root.appendChild(topRow);
    root.appendChild(infoLabel);
    // ADD the NEW Overall Training Progress Bar FIRST (or second after info)
    root.appendChild(overallProgressWrapper);
    root.appendChild(smallArrayBar);
    root.appendChild(bigArrayBar);

    // Clock update logic (which also triggers telemetry updates)
    let interval = null;
    function updateClock() {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString();
        updateInfoLabel(); // Update RAM info frequently
        updateProgressBars(); // Update ALL telemetry on each clock tick
    }

    function setRefreshInterval() {
        if (interval) clearInterval(interval);
        updateClock(); // Initial update
        interval = setInterval(updateClock, slider.value * 1000);
    }

    slider.addEventListener('input', function () {
        sliderValue.textContent = slider.value + 's';
        setRefreshInterval();
    });

    setRefreshInterval(); // Start the interval
    updateInfoLabel(); // Initial update

    // Clean up on navigation (optional)
    window.addEventListener('beforeunload', function () {
        if (interval) clearInterval(interval);
    });
})();
