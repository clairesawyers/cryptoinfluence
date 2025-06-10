/**
 * Haptic feedback utilities for mobile devices
 */

export enum HapticFeedbackType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SELECTION = 'selection',
  IMPACT_LIGHT = 'impactLight',
  IMPACT_MEDIUM = 'impactMedium',
  IMPACT_HEAVY = 'impactHeavy',
  NOTIFICATION_SUCCESS = 'notificationSuccess',
  NOTIFICATION_WARNING = 'notificationWarning',
  NOTIFICATION_ERROR = 'notificationError'
}

interface HapticFeedbackConfig {
  enabled?: boolean;
  respectReducedMotion?: boolean;
  fallbackVibration?: boolean;
}

class HapticFeedbackManager {
  private enabled: boolean = true;
  private respectReducedMotion: boolean = true;
  private fallbackVibration: boolean = true;
  private supportsHaptics: boolean = false;
  private supportsVibration: boolean = false;

  constructor(config: HapticFeedbackConfig = {}) {
    this.enabled = config.enabled ?? true;
    this.respectReducedMotion = config.respectReducedMotion ?? true;
    this.fallbackVibration = config.fallbackVibration ?? true;
    
    this.detectCapabilities();
  }

  private detectCapabilities() {
    // Check for modern haptic feedback API (mainly iOS Safari 13.1+)
    this.supportsHaptics = 'navigator' in window && 
      'vibrate' in navigator && 
      typeof (navigator as any).vibrate === 'function';
    
    // Check for basic vibration API
    this.supportsVibration = 'navigator' in window && 
      'vibrate' in navigator && 
      typeof navigator.vibrate === 'function';
  }

  private shouldTriggerFeedback(): boolean {
    if (!this.enabled) return false;
    
    // Respect reduced motion preference
    if (this.respectReducedMotion) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return false;
    }
    
    return true;
  }

  private getVibrationPattern(type: HapticFeedbackType): number | number[] {
    switch (type) {
      case HapticFeedbackType.LIGHT:
      case HapticFeedbackType.SELECTION:
        return 10;
      
      case HapticFeedbackType.MEDIUM:
      case HapticFeedbackType.IMPACT_LIGHT:
        return 20;
      
      case HapticFeedbackType.HEAVY:
      case HapticFeedbackType.IMPACT_MEDIUM:
        return 40;
      
      case HapticFeedbackType.IMPACT_HEAVY:
        return [50, 10, 50];
      
      case HapticFeedbackType.NOTIFICATION_SUCCESS:
        return [10, 30, 10];
      
      case HapticFeedbackType.NOTIFICATION_WARNING:
        return [20, 50, 20];
      
      case HapticFeedbackType.NOTIFICATION_ERROR:
        return [50, 100, 50, 100, 50];
      
      default:
        return 15;
    }
  }

  /**
   * Trigger haptic feedback
   */
  public trigger(type: HapticFeedbackType = HapticFeedbackType.LIGHT): Promise<void> {
    return new Promise((resolve) => {
      if (!this.shouldTriggerFeedback()) {
        resolve();
        return;
      }

      try {
        // Try modern haptic feedback first (iOS)
        if (this.supportsHaptics && (window as any).DeviceMotionEvent) {
          const pattern = this.getVibrationPattern(type);
          navigator.vibrate(pattern);
          resolve();
          return;
        }

        // Fallback to basic vibration
        if (this.fallbackVibration && this.supportsVibration) {
          const pattern = this.getVibrationPattern(type);
          navigator.vibrate(pattern);
          resolve();
          return;
        }

        resolve();
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
        resolve();
      }
    });
  }

  /**
   * Quick haptic feedback methods
   */
  public light() {
    return this.trigger(HapticFeedbackType.LIGHT);
  }

  public medium() {
    return this.trigger(HapticFeedbackType.MEDIUM);
  }

  public heavy() {
    return this.trigger(HapticFeedbackType.HEAVY);
  }

  public selection() {
    return this.trigger(HapticFeedbackType.SELECTION);
  }

  public success() {
    return this.trigger(HapticFeedbackType.NOTIFICATION_SUCCESS);
  }

  public warning() {
    return this.trigger(HapticFeedbackType.NOTIFICATION_WARNING);
  }

  public error() {
    return this.trigger(HapticFeedbackType.NOTIFICATION_ERROR);
  }

  public impact(intensity: 'light' | 'medium' | 'heavy' = 'medium') {
    switch (intensity) {
      case 'light':
        return this.trigger(HapticFeedbackType.IMPACT_LIGHT);
      case 'heavy':
        return this.trigger(HapticFeedbackType.IMPACT_HEAVY);
      default:
        return this.trigger(HapticFeedbackType.IMPACT_MEDIUM);
    }
  }

  /**
   * Enable or disable haptic feedback
   */
  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Check if haptic feedback is available
   */
  public isAvailable(): boolean {
    return this.supportsHaptics || this.supportsVibration;
  }

  /**
   * Get device capabilities
   */
  public getCapabilities() {
    return {
      supportsHaptics: this.supportsHaptics,
      supportsVibration: this.supportsVibration,
      enabled: this.enabled
    };
  }
}

// Global haptic feedback instance
export const hapticFeedback = new HapticFeedbackManager();

// Convenience functions
export const triggerHapticFeedback = (type?: HapticFeedbackType) => {
  return hapticFeedback.trigger(type);
};

export const lightHaptic = () => hapticFeedback.light();
export const mediumHaptic = () => hapticFeedback.medium();
export const heavyHaptic = () => hapticFeedback.heavy();
export const selectionHaptic = () => hapticFeedback.selection();
export const successHaptic = () => hapticFeedback.success();
export const warningHaptic = () => hapticFeedback.warning();
export const errorHaptic = () => hapticFeedback.error();
export const impactHaptic = (intensity?: 'light' | 'medium' | 'heavy') => hapticFeedback.impact(intensity);

// React hook for haptic feedback
export const useHapticFeedback = () => {
  return {
    trigger: hapticFeedback.trigger.bind(hapticFeedback),
    light: hapticFeedback.light.bind(hapticFeedback),
    medium: hapticFeedback.medium.bind(hapticFeedback),
    heavy: hapticFeedback.heavy.bind(hapticFeedback),
    selection: hapticFeedback.selection.bind(hapticFeedback),
    success: hapticFeedback.success.bind(hapticFeedback),
    warning: hapticFeedback.warning.bind(hapticFeedback),
    error: hapticFeedback.error.bind(hapticFeedback),
    impact: hapticFeedback.impact.bind(hapticFeedback),
    isAvailable: hapticFeedback.isAvailable.bind(hapticFeedback),
    setEnabled: hapticFeedback.setEnabled.bind(hapticFeedback)
  };
};