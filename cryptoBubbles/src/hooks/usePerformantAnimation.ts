import { useState, useEffect, useCallback, useRef } from 'react';
import { throttle, AdaptiveQualityManager, BatteryManager } from '../utils/performanceUtils';
import { useMobileDetect } from './useMobileDetect';

interface AnimationConfig {
  inactivityTimeout?: number;
  throttleMs?: number;
  reducedMotionRespect?: boolean;
  adaptiveQuality?: boolean;
  batteryOptimization?: boolean;
}

interface AnimationState {
  isAnimating: boolean;
  qualityLevel: number;
  shouldReduceMotion: boolean;
  frameRate: number;
}

export const usePerformantAnimation = (
  animationCallback: (timestamp: number, qualityLevel: number) => void,
  config: AnimationConfig = {}
) => {
  const {
    inactivityTimeout = 3000,
    throttleMs = 16, // 60fps max
    reducedMotionRespect = true,
    adaptiveQuality = true,
    batteryOptimization = true
  } = config;

  const { isMobile } = useMobileDetect();
  const animationRef = useRef<number>();
  const lastInteractionRef = useRef(Date.now());
  const qualityManagerRef = useRef<AdaptiveQualityManager>();
  const batteryManagerRef = useRef<BatteryManager>();
  
  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    qualityLevel: 1.0,
    shouldReduceMotion: false,
    frameRate: 60
  });

  // Initialize performance managers
  useEffect(() => {
    if (adaptiveQuality) {
      qualityManagerRef.current = new AdaptiveQualityManager();
    }
    if (batteryOptimization) {
      batteryManagerRef.current = new BatteryManager();
    }
  }, [adaptiveQuality, batteryOptimization]);

  // Check for reduced motion preference
  useEffect(() => {
    if (reducedMotionRespect) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleChange = () => {
        setAnimationState(prev => ({
          ...prev,
          shouldReduceMotion: mediaQuery.matches
        }));
      };
      
      handleChange(); // Initial check
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [reducedMotionRespect]);

  // Stop animations after inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Date.now() - lastInteractionRef.current > inactivityTimeout) {
        setAnimationState(prev => ({ ...prev, isAnimating: false }));
      }
    }, inactivityTimeout);
    
    return () => clearTimeout(timer);
  }, [animationState.isAnimating, inactivityTimeout]);

  // Main animation loop
  const animationLoop = useCallback((timestamp: number) => {
    if (!animationState.isAnimating || animationState.shouldReduceMotion) {
      return;
    }

    let currentQualityLevel = animationState.qualityLevel;
    
    // Update performance metrics
    if (qualityManagerRef.current) {
      const startTime = qualityManagerRef.current.startFrame();
      currentQualityLevel = qualityManagerRef.current.getQualityLevel();
      
      // Run the animation callback
      animationCallback(timestamp, currentQualityLevel);
      
      qualityManagerRef.current.updatePerformance(startTime);
      
      // Update quality level in state if changed
      setAnimationState(prev => ({
        ...prev,
        qualityLevel: currentQualityLevel
      }));
    } else {
      animationCallback(timestamp, currentQualityLevel);
    }

    // Check battery optimization
    if (batteryManagerRef.current?.shouldReducePerformance()) {
      // Reduce frame rate for battery saving
      setTimeout(() => {
        animationRef.current = requestAnimationFrame(animationLoop);
      }, 33); // ~30fps instead of 60fps
    } else {
      animationRef.current = requestAnimationFrame(animationLoop);
    }
  }, [animationCallback, animationState]);

  // Throttled animation loop for mobile devices
  const throttledAnimationLoop = useCallback(
    throttle(animationLoop, isMobile ? throttleMs * 2 : throttleMs),
    [animationLoop, isMobile, throttleMs]
  );

  // Start/stop animation
  useEffect(() => {
    if (animationState.isAnimating && !animationState.shouldReduceMotion) {
      animationRef.current = requestAnimationFrame(throttledAnimationLoop);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animationState.isAnimating, animationState.shouldReduceMotion, throttledAnimationLoop]);

  // Public methods
  const startAnimation = useCallback(() => {
    lastInteractionRef.current = Date.now();
    setAnimationState(prev => ({ ...prev, isAnimating: true }));
  }, []);

  const stopAnimation = useCallback(() => {
    setAnimationState(prev => ({ ...prev, isAnimating: false }));
  }, []);

  const recordInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (!animationState.isAnimating) {
      startAnimation();
    }
  }, [animationState.isAnimating, startAnimation]);

  const getPerformanceMetrics = useCallback(() => {
    const manager = qualityManagerRef.current;
    const battery = batteryManagerRef.current;
    
    return {
      fps: manager?.getFPS() || 0,
      qualityLevel: animationState.qualityLevel,
      batteryLevel: battery?.getBatteryLevel() || 1,
      isLowPowerMode: battery?.isInLowPowerMode() || false,
      shouldReduceMotion: animationState.shouldReduceMotion
    };
  }, [animationState]);

  return {
    isAnimating: animationState.isAnimating,
    qualityLevel: animationState.qualityLevel,
    shouldReduceMotion: animationState.shouldReduceMotion,
    startAnimation,
    stopAnimation,
    recordInteraction,
    getPerformanceMetrics
  };
};