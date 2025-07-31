// js/ui/telemetry-panel.js

import { globalData } from '../Globals.js';
import { getSmallL, getBigL } from '../Globals.js';  // ✅ Import needed functions

export function createTelemetryPanel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`[TelemetryPanel] Container #${containerId} not found`);
        return;
    }

    // 🔥 Ensure telemetry is initialized
    if (!globalData.telemetry) {
        globalData.telemetry = {
            tokenCount: 0,
            trainingProgress: 0,
            tempMemoryUsed: 0,
            tempMemoryTotal: 1000,
            bigMemoryUsed: 0,
            bigMemoryTotal: 1000000,
            ramUsed: 0,
            ramTotal: 2144
        };
    }

    const init = globalData.telemetry;

    // Render the panel
    container.innerHTML = `
        <div class="telemetry-panel">
            <!-- Top Row: Summary Label -->
            <div class="telemetry-top-row">
                <div class="telemetry-summary" id="telemetry-summary">
                    Tokens: ${formatNumber(init.tokenCount)} | RAM: ${formatNumber(init.ramUsed)} / ${formatNumber(init.ramTotal)} MB
                </div>
            </div>

            <!-- Bottom Row: Progress Bars -->
            <div class="telemetry-progress-row">
                <!-- Training Progress -->
                <div class="progress-item">
                    <label>Training Progress</label>
                    <div class="progress-bar">
                        <div id="progress-fill-training" class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-label" id="label-training">0%</div>
                </div>

                <!-- Temp Memory Usage -->
                <div class="progress-item">
                    <label>Temp Memory</label>
                    <div class="progress-bar">
                        <div id="progress-fill-temp" class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-label" id="label-temp">0 / 1,000</div>
                </div>

                <!-- Big Memory Usage -->
                <div class="progress-item">
                    <label>Big Memory</label>
                    <div class="progress-bar">
                        <div id="progress-fill-big" class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-label" id="label-big">0 / 1,000,000</div>
                </div>
            </div>
        </div>
    `;

    // Cache DOM elements
    const summaryEl = document.getElementById('telemetry-summary');
    const fillTraining = document.getElementById('progress-fill-training');
    const labelTraining = document.getElementById('label-training');
    const fillTemp = document.getElementById('progress-fill-temp');
    const labelTemp = document.getElementById('label-temp');
    const fillBig = document.getElementById('progress-fill-big');
    const labelBig = document.getElementById('label-big');

    // Expose update function globally
    window.updateTelemetry = function(data) {
        let changed = false;

        // Token Count & RAM
        if (data.tokenCount !== undefined || data.ramUsed !== undefined || data.ramTotal !== undefined) {
            const tokenCount = data.tokenCount ?? globalData.telemetry?.tokenCount ?? 0;
            const ramUsed = data.ramUsed ?? globalData.telemetry?.ramUsed ?? 0;
            const ramTotal = data.ramTotal ?? globalData.telemetry?.ramTotal ?? 2144;

            summaryEl.textContent = `Tokens: ${formatNumber(tokenCount)} | RAM: ${formatNumber(ramUsed)} / ${formatNumber(ramTotal)} MB`;
            globalData.telemetry = { ...globalData.telemetry, tokenCount, ramUsed, ramTotal };
            changed = true;
        }

        // Training Progress
        if (data.trainingProgress !== undefined) {
            const progress = Math.min(100, Math.max(0, data.trainingProgress));
            fillTraining.style.width = `${progress}%`;
            labelTraining.textContent = `${Math.round(progress)}%`;
            globalData.telemetry = { ...globalData.telemetry, trainingProgress: progress };
            changed = true;
        }

        // Temp Memory
        if (data.tempMemoryUsed !== undefined || data.tempMemoryTotal !== undefined) {
            const used = data.tempMemoryUsed ?? globalData.telemetry?.tempMemoryUsed ?? 0;
            const total = data.tempMemoryTotal ?? globalData.telemetry?.tempMemoryTotal ?? getSmallL(); // ✅ Use function
            const percent = calculatePercent(used, total);

            fillTemp.style.width = `${percent}%`;
            labelTemp.textContent = `${formatNumber(used)} / ${formatNumber(total)}`;
            globalData.telemetry = { ...globalData.telemetry, tempMemoryUsed: used, tempMemoryTotal: total };
            changed = true;
        }

        // Big Memory
        if (data.bigMemoryUsed !== undefined || data.bigMemoryTotal !== undefined) {
            const used = data.bigMemoryUsed ?? globalData.telemetry?.bigMemoryUsed ?? 0;
            const total = data.bigMemoryTotal ?? globalData.telemetry?.bigMemoryTotal ?? getBigL(); // ✅ Use function
            const percent = calculatePercent(used, total);

            fillBig.style.width = `${percent}%`;
            labelBig.textContent = `${formatNumber(used)} / ${formatNumber(total)}`;
            globalData.telemetry = { ...globalData.telemetry, bigMemoryUsed: used, bigMemoryTotal: total };
            changed = true;
        }

        if (changed) {
            document.dispatchEvent(new CustomEvent('telemetryUpdated', { detail: globalData.telemetry }));
        }
    };

    // ✅ Initialize telemetry with dynamic L values
    window.updateTelemetry({
        tokenCount: 0,
        trainingProgress: 0,
        tempMemoryUsed: 0,
        tempMemoryTotal: getSmallL(),  // ✅ Now works
        bigMemoryUsed: 0,
        bigMemoryTotal: getBigL(),    // ✅ Now works
        ramUsed: 0,
        ramTotal: getBigL()
    });
}

// Helper: Format numbers with commas
function formatNumber(num) {
    return typeof num === 'number' ? num.toLocaleString() : String(num);
}

// Helper: Calculate percentage, capped at 100%
function calculatePercent(used, total) {
    return total > 0 ? Math.min(100, (used / total) * 100) : 0;
}