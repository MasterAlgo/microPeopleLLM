// /js/Generator.js

import { createGeneratorLayout } from '../js/ui/generatorUI.js';
import { GeneratorMain }         from '../js/generator/generatorMain.js';

/**
 * Generator.js
 * Orchestration layer: builds UI and connects interactions.
 */

export class Generator {
    constructor() {
        this.container = document.getElementById('generator-content');
        this.generatorMain = new GeneratorMain();
        this.startStopBtn = null;
        this.promptInput = null;
    }

    init() {
        if (!this.container) {
            console.warn('Generator: #generator-content not found');
            return;
        }

        this.container.innerHTML = '';

        const layout = createGeneratorLayout();

        // Extract key elements from layout
        this.startStopBtn = layout.querySelector('.toggle-btn');
        this.promptInput = layout.querySelector('input[type="text"]');

        // Attach event listeners
        this.startStopBtn.addEventListener('click', () => {
            this.handleStartStop();
        });

        // Save reference to result panel if needed later
        // e.g. this.resultPanel = layout.querySelector('.gen-panel h3:contains("Result")')...

        this.container.appendChild(layout);

        console.info('✅ Generator UI built and wired');
    }

    handleStartStop() {
        const isRunning = this.startStopBtn.textContent.trim() === 'Stop';

        if (isRunning) {
            this.generatorMain.stop();
            this.startStopBtn.textContent = 'Start';
            this.startStopBtn.style.backgroundColor = 'var(--color-primary)';
        } else {
            console.log('Prompt:', this.promptInput.value);
            this.generatorMain.start();
            this.startStopBtn.textContent = 'Stop';
            this.startStopBtn.style.backgroundColor = 'var(--color-danger)';
        }
    }
}