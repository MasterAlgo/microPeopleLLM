// js/ui/console-panel.js

let consoleEnabled = true; // Toggle this to disable all logging in production

export function setupConsole() {
  const output = document.getElementById('console-output');
  if (!output) return;

  // Save original console methods
  const original = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };

  // Replace console methods
  console.log = function (...args) {
//    original.log.apply(console, args);
    if (consoleEnabled) addLogEntry('log', 'LOG', args);
  };

  console.warn = function (...args) {
//    original.warn.apply(console, args);
    if (consoleEnabled) addLogEntry('warn', 'WARN', args);
  };

  console.error = function (...args) {
//    original.error.apply(console, args);
    if (consoleEnabled) addLogEntry('error', 'ERROR', args);
  };

  console.info = function (...args) {
//    original.info.apply(console, args);
    if (consoleEnabled) addLogEntry('info', 'INFO', args);
  };

  // Append message to UI
  function addLogEntry(type, label, args) {
    const entry = document.createElement('p');
    entry.className = `console-line ${type}`;
    entry.innerHTML = `<strong>[${label}]</strong> ${formatArgs(args)}`;
    output.appendChild(entry);
    output.scrollTop = output.scrollHeight; // Auto-scroll
  }

  // Format arguments into readable string
  function formatArgs(args) {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return '[Circular or invalid JSON]';
        }
      }
      return String(arg);
    }).join(' ');
  }

  // Provide a way to clear console
  window.clearDebugConsole = function () {
    output.innerHTML = '';
    original.log('.debugLine console cleared');
  };

  // Provide disable method
  window.disableDebugConsole = function () {
    consoleEnabled = false;
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.info = () => {};
    addLogEntry('info', 'INFO', ['Debug console disabled']);
  };
}