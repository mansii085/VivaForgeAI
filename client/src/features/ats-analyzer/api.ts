import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface AtsAnalysisResult {
  overallScore: number;
  breakdown: { label: string; score: number }[];
  improvements: { type: 'success' | 'warning'; title: string; description: string }[];
}

export const useLatestAtsQuery = () => {
  return useQuery({
    queryKey: ['latestAtsAnalysis'],
    queryFn: async (): Promise<AtsAnalysisResult | null> => {
      const response = await api.get('/ats/latest');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
