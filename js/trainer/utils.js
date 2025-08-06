// js/trainer/utils.js
import { globalData } from '../Globals.js';

/**
 * Safe helper to call window.setStatusBar if available
 */
export function safeSetStatusBar(msg, color) {
    if (typeof window.setStatusBar === 'function') {
        window.setStatusBar(msg, color);
    }
}

/**
 * Safe helper to call window.updateTelemetry if available
 */
export function safeUpdateTelemetry(data) {
    if (typeof window.updateTelemetry === 'function') {
        window.updateTelemetry(data);
    }
}