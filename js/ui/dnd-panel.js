// js/ui/dnd-panel.js

import { setDroppedFiles, setInputDefined } from '../Globals.js';

export function createDnDPanel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`[DnDPanel] Container #${containerId} not found`);
        return;
    }

    container.innerHTML = `
        <div class="dnd-row">
            <div class="dnd-zone" data-type="learning">
                <h3>Learning</h3>
                <div class="dnd-area">Drag .txt files here</div>
            </div>
            <div class="dnd-zone" data-type="unlearning">
                <h3>Unlearning</h3>
                <div class="dnd-area">Drag .txt files here</div>
            </div>
        </div>
    `;

    document.querySelectorAll('.dnd-area').forEach(area => {
        // Highlight on hover
        area.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            area.classList.add('active');
        });

        area.addEventListener('dragleave', () => {
            area.classList.remove('active');
        });

        area.addEventListener('drop', e => {
            e.preventDefault();
            e.stopPropagation();
            area.classList.remove('active');

            const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.txt'));
            if (files.length === 0) {
                area.textContent = '⚠️ No .txt files';
                setTimeout(() => {
                    area.textContent = '';
                }, 1500);
                return;
            }

            // Only handle Learning zone for now
            if (area.parentElement.dataset.type === 'learning') {
                setDroppedFiles(files);
                setInputDefined(true);

                // Update status bar
                if (typeof window.setStatusBar === 'function') {
                    const totalKB = Math.round(files.reduce((sum, f) => sum + f.size, 0) / 1024);
                    window.setStatusBar(`📁 ${files.length} file(s) loaded (${totalKB} KB)`, '#00796b');
                }

                // Trigger training if start button is handled elsewhere
                // Example: you might call startTraining(files) from controls-panel
            }

            // Visual feedback
            area.innerHTML = '';
            const feedback = document.createElement('div');
            feedback.innerHTML = `<small>✅ ${files.length} file(s) added</small>`;
            area.appendChild(feedback);

            // Clear feedback after 2s
            setTimeout(() => {
                if (area.children.length > 0 && area.querySelector('small')) {
                    area.innerHTML = '';
                }
            }, 2000);
        });
    });
}