import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface DashboardActivity {
  type: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

export interface DashboardData {
  stats: {
    atsScore: number | null;
    interviewCount: number;
    avgInterviewScore: number;
    resumeCompletion: number;
    learningProgress: number;
  };
  skillRadar: {
    resume: number;
    ats: number;
    interview: number;
    jdMatch: number;
    learning: number;
    research: number;
  };
  quickActionsData: {
    resumeCount: number;
    ragDocCount: number;
    avgJdMatchScore: number;
    interviewCount: number;
    learningProgress: number;
  };
  recentActivity: DashboardActivity[];
}

export const useDashboardQuery = () => {
  return useQuery({
    queryKey: ['dashboardData'],
    queryFn: async (): Promise<DashboardData> => {
      const response = await api.get('/dashboard');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
