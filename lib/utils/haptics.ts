/**
 * Haptic Feedback Utility
 * Provides vibration patterns for mobile devices via the Vibration API
 * Falls back gracefully on unsupported devices (desktop, older browsers)
 */

export const haptics = {
  /** Light tap — button press, nav tap */
  light: () => {
    if (typeof navigator !== 'undefined') navigator.vibrate?.(10)
  },

  /** Medium tap — submit, confirm */
  medium: () => {
    if (typeof navigator !== 'undefined') navigator.vibrate?.(20)
  },

  /** Heavy tap — delete, destructive action */
  heavy: () => {
    if (typeof navigator !== 'undefined') navigator.vibrate?.(50)
  },

  /** Success pattern — short-pause-short */
  success: () => {
    if (typeof navigator !== 'undefined') navigator.vibrate?.([10, 50, 10])
  },

  /** Error pattern — long-pause-long */
  error: () => {
    if (typeof navigator !== 'undefined') navigator.vibrate?.([50, 100, 50])
  },
}
