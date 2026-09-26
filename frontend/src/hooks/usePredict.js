import { useState } from 'react';
import { predict as apiPredict, simulate as apiSimulate } from '../services/api';

export const usePredict = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const runPrediction = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiPredict(data);
      setPrediction(result);
      return result;
    } catch (err) {
      setError(err.message || 'Prediction failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiSimulate(data);
      setPrediction(result);
      return result;
    } catch (err) {
      setError(err.message || 'Simulation failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return { prediction, loading, error, runPrediction, runSimulation };
};
