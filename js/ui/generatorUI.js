// /js/ui/generatorUI.js

/**
 * generatorUI.js
 * Builds the full Generator panel UI:
 * - Left: 3-row layout (Context, Prompt + Control, Result)
 * - Right: Empty placeholder (33% width)
 *
 * Uses existing CSS variables and styles.
 */

export function createGeneratorLayout() {
    const layout = document.createElement('div');
    layout.className = 'gen-layout';
    layout.style.display = 'flex';
    layout.style.gap = '20px';
    layout.style.width = '100%';
    layout.style.height = '600px'; // Increased height for 3 rows
    layout.style.overflow = 'hidden';

    // 👉 Left Panel (66% width) - Multi-row layout
    const leftPanel = document.createElement('div');
    leftPanel.className = 'gen-panel-left';
    leftPanel.style.display = 'flex';
    leftPanel.style.flexDirection = 'column';
    leftPanel.style.flex = '2';
    leftPanel.style.height = '100%';
    leftPanel.style.gap = '12px';

    // Row 1: Context (~10%)
    const contextRow = createPanel('Context');
    contextRow.style.flex = '1';
    contextRow.style.fontSize = '14px';
    contextRow.style.overflow = 'auto';
    contextRow.style.padding = '12px';
    contextRow.style.color = 'var(--color-text-light)';
    contextRow.textContent = 'Context will appear here...'; // Placeholder

    // Row 2: Prompt Input + Control Button (~10%)
    const promptRow = document.createElement('div');
    promptRow.className = 'gen-prompt-row';
    promptRow.style.flex = '1';
    promptRow.style.display = 'flex';
    promptRow.style.alignItems = 'center';
    promptRow.style.gap = '10px';
    promptRow.style.padding = '0 0 0 4px';
    promptRow.style.fontFamily = 'var(--font-main)';

    const promptLabel = document.createElement('label');
    promptLabel.textContent = 'Prompt:';
    promptLabel.style.fontSize = '14px';
    promptLabel.style.color = 'var(--color-text)';
    promptLabel.style.minWidth = '50px';

    const promptInput = document.createElement('input');
    promptInput.dataset.role = 'prompt-input';
    promptInput.type = 'text';
    promptInput.placeholder = 'Enter generation prompt...';
    promptInput.style.flex = '1';
    promptInput.style.padding = '8px 10px';
    promptInput.style.border = '1px solid var(--color-border)';
    promptInput.style.borderRadius = 'var(--radius-sm)';
    promptInput.style.fontSize = '14px';
    promptInput.style.outline = 'none';
    promptInput.style.fontFamily = 'var(--font-main)';

    const startStopBtn = document.createElement('button');
    startStopBtn.type = 'button';
    startStopBtn.className = 'toggle-btn';
    startStopBtn.style.padding = '6px 12px';
    startStopBtn.style.fontSize = '14px';
    startStopBtn.style.fontWeight = '500';
    startStopBtn.style.borderRadius = 'var(--radius-sm)';
    startStopBtn.style.border = 'none';
    startStopBtn.style.cursor = 'pointer';
    startStopBtn.style.color = 'white';
    startStopBtn.style.backgroundColor = 'var(--color-primary)';
    startStopBtn.textContent = 'Start';

    // Toggle behavior will be handled later in Generator.js
    promptRow.appendChild(promptLabel);
    promptRow.appendChild(promptInput);
    promptRow.appendChild(startStopBtn);

    // Row 3: Result (~80%)
    const resultRow = createPanel('Result');
    resultRow.dataset.role =  'result'; // "result"   
    resultRow.style.fontSize = '14px';
    resultRow.style.overflow = 'auto';
    resultRow.style.padding = '12px';
    resultRow.style.color = 'var(--color-text)';
    resultRow.style.lineHeight = '1.5';
    resultRow.textContent = 'Generated output will appear here...'; // Placeholder
    resultRow.style.whiteSpace = 'pre-wrap';

    // Assemble left panel
    leftPanel.appendChild(contextRow);
    leftPanel.appendChild(promptRow);
    leftPanel.appendChild(resultRow);

    // 👉 Right Panel (33% width) - Empty for now
//    const rightPanel = document.createElement('Candidates');
    const rightPanel = createPanel('Candidates');
    rightPanel.dataset.role =  'candidates-panel'; // "candidates"   
    rightPanel.className = 'gen-panel-right';
    rightPanel.style.flex = '1';
    rightPanel.style.backgroundColor = 'var(--color-light)';
    rightPanel.style.borderRadius = 'var(--radius)';
    rightPanel.style.padding = '16px';
    rightPanel.style.display = 'flex';
    rightPanel.style.flexDirection = 'column';
    rightPanel.style.height = '100%';
    rightPanel.style.overflow = 'auto';
    rightPanel.style.boxSizing = 'border-box';
    rightPanel.textContent = 'Candidates will appear here...'; // No label, can be used later
    rightPanel.style.whiteSpace = 'pre-line'; // ← This makes \n work!
    rightPanel.style.fontFamily = 'monospace';
    rightPanel.style.whiteSpace = 'pre'; // Preserves ALL spaces and line breaks

    // Assemble full layout
    layout.appendChild(leftPanel);
    layout.appendChild(rightPanel);

    return layout;
}

/**
 * Utility: Creates a standard panel with optional title
 * @param {string} title
 * @returns {HTMLElement}
 */
function createPanel(title) {
    const panel = document.createElement('div');
    panel.style.backgroundColor = 'white';
    panel.style.borderRadius = 'var(--radius)';
    panel.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.justifyContent = 'flex-start';
    panel.style.alignItems = 'stretch';
    panel.style.boxSizing = 'border-box';
    panel.style.border = '1px solid var(--color-border)';

    if (title) {
        const header = document.createElement('h3');
        header.textContent = title;
        header.style.margin = '0 0 8px 0';
        header.style.padding = '0';
        header.style.color = 'var(--color-dark)';
        header.style.fontSize = '15px';
        header.style.fontWeight = '500';
        panel.appendChild(header);
    }

    return panel;
}