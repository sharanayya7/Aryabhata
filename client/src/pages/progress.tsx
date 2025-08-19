import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/layout/navigation";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { TrendingUp, BookOpen, Target, Clock, Calendar, Award } from "lucide-react";

export default function ProgressPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const { data: userProgress, isLoading: progressLoading, error: progressError } = useQuery({
    queryKey: ["/api/progress"],
    retry: false,
  });

  const { data: quizAttempts, isLoading: attemptsLoading, error: attemptsError } = useQuery({
    queryKey: ["/api/quiz/attempts"],
    retry: false,
  });

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["/api/subjects"],
    retry: false,
  });

  const { data: recentActivity, error: activityError } = useQuery({
    queryKey: ["/api/activity"],
    retry: false,
  });

  useEffect(() => {
    const errors = [progressError, attemptsError, activityError].filter(Boolean);
    errors.forEach((error) => {
      if (error && isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        logout();
      }
    });
  }, [progressError, attemptsError, activityError, toast]);

  const calculateStats = () => {
    if (!quizAttempts || quizAttempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        studyStreak: user?.streakDays || 0,
        totalStudyTime: user?.totalStudyMinutes || 0
      };
    }

    const totalAttempts = quizAttempts.length;
    const totalQuestions = quizAttempts.reduce((sum: number, attempt: any) => sum + attempt.totalQuestions, 0);
    const correctAnswers = quizAttempts.reduce((sum: number, attempt: any) => sum + attempt.score, 0);
    const averageScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const bestScore = Math.max(...quizAttempts.map((attempt: any) => Math.round((attempt.score / attempt.totalQuestions) * 100)), 0);
    const accuracy = averageScore;

    return {
      totalAttempts,
      averageScore,
      bestScore,
      totalQuestions,
      correctAnswers,
      accuracy,
      studyStreak: user?.streakDays || 0,
      totalStudyTime: user?.totalStudyMinutes || 0
    };
  };

  const getSubjectProgress = (subjectId: string) => {
    if (!userProgress) return 0;
    const subjectTopics = userProgress.filter((progress: any) => 
      subjects?.find((s: any) => s.id === subjectId)
    );
    if (subjectTopics.length === 0) return 0;
    const avgCompletion = subjectTopics.reduce((sum: number, topic: any) => 
      sum + (topic.completionPercentage || 0), 0) / subjectTopics.length;
    return Math.round(avgCompletion);
  };

  const getWeeklyActivity = () => {
    if (!recentActivity) return Array(7).fill(0);
    
    const weeklyData = Array(7).fill(0);
    const today = new Date();
    
    recentActivity.forEach((activity: any) => {
      const activityDate = new Date(activity.createdAt);
      const daysDiff = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff < 7) {
        weeklyData[6 - daysDiff] += 1;
      }
    });
    
    return weeklyData;
  };

  const stats = calculateStats();
  const weeklyActivity = getWeeklyActivity();
  const maxActivity = Math.max(...weeklyActivity, 1);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">My Progress</h1>
          <p className="text-gray-600">Track your UPSC preparation journey and analyze your performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center" data-testid="card-total-questions">
            <CardContent className="pt-2">
              <div className="text-2xl font-bold text-primary-600">{stats.totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </CardContent>
          </Card>
          <Card className="p-4 text-center" data-testid="card-accuracy">
            <CardContent className="pt-2">
              <div className="text-2xl font-bold text-green-600">{stats.accuracy}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </CardContent>
          </Card>
          <Card className="p-4 text-center" data-testid="card-study-streak">
            <CardContent className="pt-2">
              <div className="text-2xl font-bold text-secondary-600">{stats.studyStreak}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </CardContent>
          </Card>
          <Card className="p-4 text-center" data-testid="card-study-time">
            <CardContent className="pt-2">
              <div className="text-2xl font-bold text-purple-600">{Math.floor(stats.totalStudyTime / 60)}h</div>
              <div className="text-sm text-gray-600">Study Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
            
            {attemptsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900" data-testid="text-total-attempts">{stats.totalAttempts}</div>
                  <div className="text-sm text-gray-600">Quiz Attempts</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900" data-testid="text-average-score">{stats.averageScore}%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900" data-testid="text-best-score">{stats.bestScore}%</div>
                  <div className="text-sm text-gray-600">Best Score</div>
                </div>
              </div>
            )}

            {/* Weekly Activity Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Weekly Activity</h4>
              <div className="flex items-end space-x-2 h-20">
                {weeklyActivity.map((activity, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-primary-200 rounded-t"
                      style={{ height: `${(activity / maxActivity) * 60}px` }}
                      data-testid={`activity-bar-${index}`}
                    >
                      {activity > 0 && (
                        <div className="w-full bg-primary-600 rounded-t" style={{ height: '100%' }}></div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Study Goals */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Goals</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">Daily Study Time</span>
                  <span className="text-sm font-medium text-primary-600">2h / 4h</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">Weekly Quiz Target</span>
                  <span className="text-sm font-medium text-green-600">3 / 5</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">Monthly Progress</span>
                  <span className="text-sm font-medium text-yellow-600">65%</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
            </div>
          </Card>
        </div>

        {/* Subject-wise Progress */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Subject-wise Progress</h3>
          
          {subjectsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : subjects && subjects.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {subjects.map((subject: any, index: number) => {
                const progress = getSubjectProgress(subject.id);
                return (
                  <div key={subject.id} className="border border-gray-200 rounded-lg p-4" data-testid={`subject-progress-${index}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{subject.name}</h4>
                      <span className="text-sm font-medium text-primary-600">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 mb-3" />
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>Topics: 12</div>
                      <div>Completed: {Math.floor(12 * progress / 100)}</div>
                      <div>Time: {Math.floor(Math.random() * 50) + 10}h</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No subjects available for progress tracking.</p>
            </div>
          )}
        </Card>

        {/* Recent Quiz Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Quiz Performance</h3>
          
          {attemptsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : quizAttempts && quizAttempts.length > 0 ? (
            <div className="space-y-4">
              {quizAttempts.slice(0, 5).map((attempt: any, index: number) => {
                const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
                const getScoreColor = (score: number) => {
                  if (score >= 80) return "text-green-600 bg-green-100";
                  if (score >= 60) return "text-blue-600 bg-blue-100";
                  if (score >= 40) return "text-yellow-600 bg-yellow-100";
                  return "text-red-600 bg-red-100";
                };

                return (
                  <div key={attempt.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg" data-testid={`quiz-performance-${index}`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getScoreColor(percentage).split(' ')[1]}`}>
                        <Target className={`h-5 w-5 ${getScoreColor(percentage).split(' ')[0]}`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {attempt.difficulty.charAt(0).toUpperCase() + attempt.difficulty.slice(1)} Quiz
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(percentage).split(' ')[0]}`}>
                        {percentage}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {attempt.score}/{attempt.totalQuestions}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No quiz attempts yet</p>
              <p className="text-sm text-gray-500">Complete some quizzes to see your performance analysis here.</p>
            </div>
          )}
        </Card>
      </main>

      <MobileNav />
    </div>
  );
}
