// js/main.js

import { createDnDPanel } from './ui/dnd-panel.js';
import { createControlsPanel } from './ui/controls-panel.js';
import { setupConsole } from './ui/console-panel.js';
import { createTelemetryPanel } from './ui/telemetry-panel.js';
import { Generator } from '../js/Generator.js';

document.addEventListener('DOMContentLoaded', () => {

    // Prevent default drag behaviors across the whole document
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, e => {
            e.preventDefault();  // ← Critical: stops browser from opening files
            e.stopPropagation();
        }, false);
    });

    // Optional: Visual feedback on body when dragging
    document.body.addEventListener('dragover', () => {
        document.body.classList.add('drag-over-body');
    });
    document.body.addEventListener('dragleave', () => {
        document.body.classList.remove('drag-over-body');
    });
    document.body.addEventListener('drop', () => {
        document.body.classList.remove('drag-over-body');
    });
    
    
    const generator = new Generator();
    generator.init();
    
    // Initialize UI panels
    setupConsole();
    createDnDPanel('dnd-container');
    createControlsPanel('controls-container');
    createTelemetryPanel('telemetry-content');

    console.info("✅ All panels loaded");
});