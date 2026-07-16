import mongoose from 'mongoose';
import Resume from '../resume/model.js';
import Interview from '../interview/model.js';
import JDMatch from '../jd-matcher/model.js';
import Roadmap from '../learning/model.js';
import { RAGDocument } from '../rag/model.js';
import ATSAnalysis from '../ats/model.js';

export class DashboardService {
  public async getDashboardData(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Resumes
    const resumes = await Resume.find({ userId: userObjectId }).sort({ createdAt: -1 });
    const resumeCount = resumes.length;
    let resumeCompletion = 0;
    if (resumeCount > 0) {
      const latestResume = resumes[0];
      const parsed = latestResume.parsedData;
      let filledFields = 0;
      let totalFields = 5;
      if (parsed?.skills?.length > 0) filledFields++;
      if (parsed?.experience?.length > 0) filledFields++;
      if (parsed?.education?.length > 0) filledFields++;
      if (parsed?.certifications?.length > 0) filledFields++;
      if (parsed?.projects?.length > 0) filledFields++;
      resumeCompletion = Math.round((filledFields / totalFields) * 100);
    }

    // 2. Interviews
    const interviews = await Interview.find({ userId: userObjectId });
    const completedInterviews = interviews.filter(i => i.status === 'completed');
    const interviewCount = completedInterviews.length;
    let avgInterviewScore = 0;
    if (interviewCount > 0) {
      const totalScore = completedInterviews.reduce((acc, curr) => acc + (curr.overallScores?.overallScore || 0), 0);
      avgInterviewScore = Math.round(totalScore / interviewCount);
    }

    // 3. Learning Progress
    const roadmaps = await Roadmap.find({ userId: userObjectId }).sort({ createdAt: -1 });
    let learningProgress = 0;
    if (roadmaps.length > 0) {
      const activeRoadmap = roadmaps[0];
      if (activeRoadmap.progress.totalTopics > 0) {
        learningProgress = Math.round((activeRoadmap.progress.completedTopics / activeRoadmap.progress.totalTopics) * 100);
      }
    }

    // 4. JD Match
    const matches = await JDMatch.find({ userId: userObjectId });
    let avgJdMatchScore = 0;
    if (matches.length > 0) {
      const totalMatch = matches.reduce((acc, curr) => acc + (curr.matchResult?.overallMatch || 0), 0);
      avgJdMatchScore = Math.round(totalMatch / matches.length);
    }

    // 4.5 ATS Analysis
    const atsRecord = await ATSAnalysis.findOne({ userId: userObjectId }).sort({ createdAt: -1 });
    const atsScore = atsRecord ? atsRecord.overallScore : null;

    // 5. RAG Docs
    const ragDocs = await RAGDocument.countDocuments({ userId: userObjectId });

    // 6. Recent Activity
    const activities: Array<{
      type: string;
      title: string;
      description: string;
      date: Date;
      icon: string;
    }> = [];

    if (resumes.length > 0) {
      activities.push({
        type: 'resume',
        title: 'Resume Uploaded',
        description: `Uploaded ${resumes[0].title}`,
        date: resumes[0].createdAt,
        icon: 'FileText'
      });
    }

    if (completedInterviews.length > 0) {
      const latestInt = completedInterviews.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
      activities.push({
        type: 'interview',
        title: 'Interview Completed',
        description: `Completed mock interview for ${latestInt.config.role}`,
        date: latestInt.updatedAt,
        icon: 'MessageSquare'
      });
    }

    if (matches.length > 0) {
      const latestMatch = matches.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      activities.push({
        type: 'jd-match',
        title: 'JD Analysis Completed',
        description: `Analyzed role: ${latestMatch.roleName || 'Unknown Role'}`,
        date: latestMatch.createdAt,
        icon: 'Briefcase'
      });
    }

    if (roadmaps.length > 0 && roadmaps[0].progress.lastActivityDate) {
      activities.push({
        type: 'learning',
        title: 'Learning Progress Updated',
        description: `Completed ${roadmaps[0].progress.completedTopics} topics`,
        date: roadmaps[0].progress.lastActivityDate,
        icon: 'BookOpen'
      });
    }

    return {
      stats: {
        atsScore: atsScore,
        interviewCount,
        avgInterviewScore,
        resumeCompletion,
        learningProgress,
      },
      skillRadar: {
        resume: resumeCompletion,
        ats: atsScore || 0,
        interview: avgInterviewScore,
        jdMatch: avgJdMatchScore,
        learning: learningProgress,
        research: Math.min(ragDocs * 10, 100),
      },
      quickActionsData: {
        resumeCount,
        ragDocCount: ragDocs,
        avgJdMatchScore,
        interviewCount,
        learningProgress
      },
      recentActivity: activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 3)
    };
  }
}

export const dashboardService = new DashboardService();
