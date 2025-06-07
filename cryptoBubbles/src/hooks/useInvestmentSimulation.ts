import { useState, useEffect } from 'react';
import { InvestmentService } from '../services/investmentService';
import { InvestmentSimulation, InvestmentStrategy } from '../types/investment';

interface UseInvestmentSimulationProps {
  coinMentions?: string[];
  videoPublishDate?: string;
  videoTitle?: string;
  channelName?: string;
  investmentAmount?: number;
  investmentDelayHours?: number;
}

interface UseInvestmentSimulationReturn {
  simulation: InvestmentSimulation | null;
  strategies: InvestmentStrategy[];
  loading: boolean;
  error: string | null;
  runSimulation: (
    coins: string[],
    publishDate: string,
    amount?: number,
    delayHours?: number,
    title?: string,
    channel?: string
  ) => Promise<void>;
  clearSimulation: () => void;
}

export const useInvestmentSimulation = (
  props?: UseInvestmentSimulationProps
): UseInvestmentSimulationReturn => {
  const [simulation, setSimulation] = useState<InvestmentSimulation | null>(null);
  const [strategies, setStrategies] = useState<InvestmentStrategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const investmentService = new InvestmentService();

  const runSimulation = async (
    coins: string[],
    publishDate: string,
    amount: number = 1000,
    delayHours: number = 24,
    title: string = '',
    channel: string = ''
  ) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 useInvestmentSimulation: Starting simulation...');
      
      // Create the investment simulation
      const newSimulation = await investmentService.createInvestmentSimulation(
        coins,
        publishDate,
        amount,
        delayHours,
        title,
        channel
      );

      // Generate strategy comparison
      const newStrategies = await investmentService.generateStrategyComparison(newSimulation);

      setSimulation(newSimulation);
      setStrategies(newStrategies);

      console.log('✅ useInvestmentSimulation: Simulation completed successfully');
    } catch (err) {
      console.error('❌ useInvestmentSimulation: Simulation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to run simulation');
      setSimulation(null);
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSimulation = () => {
    setSimulation(null);
    setStrategies([]);
    setError(null);
  };

  // Auto-run simulation if props are provided
  useEffect(() => {
    if (props?.coinMentions && props.videoPublishDate) {
      runSimulation(
        props.coinMentions,
        props.videoPublishDate,
        props.investmentAmount,
        props.investmentDelayHours,
        props.videoTitle,
        props.channelName
      );
    }
  }, [
    props?.coinMentions,
    props?.videoPublishDate,
    props?.investmentAmount,
    props?.investmentDelayHours,
    props?.videoTitle,
    props?.channelName
  ]);

  return {
    simulation,
    strategies,
    loading,
    error,
    runSimulation,
    clearSimulation
  };
};