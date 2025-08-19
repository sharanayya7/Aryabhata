import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/layout/navigation";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Target, Clock, Trophy, CheckCircle } from "lucide-react";

export default function Practice() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("basic");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["current-affairs"]);

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["/api/subjects"],
    retry: false,
  });

  const { data: quizAttempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ["/api/quiz/attempts"],
    retry: false,
  });

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const attemptDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - attemptDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Practice Tests</h1>
          <p className="text-gray-600">Test your knowledge with our comprehensive question bank and track your performance</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quiz Configuration */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Start New Quiz</h3>
              
              {/* Difficulty Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Difficulty Level</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant={selectedDifficulty === "basic" ? "default" : "outline"}
                    onClick={() => setSelectedDifficulty("basic")}
                    className="text-xs"
                    data-testid="button-difficulty-basic"
                  >
                    Basic
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedDifficulty === "advanced" ? "default" : "outline"}
                    onClick={() => setSelectedDifficulty("advanced")}
                    className="text-xs"
                    data-testid="button-difficulty-advanced"
                  >
                    Advanced
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedDifficulty === "deep" ? "default" : "outline"}
                    onClick={() => setSelectedDifficulty("deep")}
                    className="text-xs"
                    data-testid="button-difficulty-deep"
                  >
                    Deep
                  </Button>
                </div>
              </div>

              {/* Subject Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Select Subjects</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="current-affairs"
                      checked={selectedSubjects.includes("current-affairs")}
                      onCheckedChange={() => handleSubjectToggle("current-affairs")}
                      data-testid="checkbox-current-affairs"
                    />
                    <label htmlFor="current-affairs" className="text-sm text-gray-700">Current Affairs</label>
                  </div>
                  
                  {subjectsLoading ? (
                    <div className="flex justify-center py-2">
                      <LoadingSpinner />
                    </div>
                  ) : subjects && subjects.map((subject: any, index: number) => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject.id}
                        checked={selectedSubjects.includes(subject.id)}
                        onCheckedChange={() => handleSubjectToggle(subject.id)}
                        data-testid={`checkbox-subject-${index}`}
                      />
                      <label htmlFor={subject.id} className="text-sm text-gray-700">{subject.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiz Options */}
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-medium">10</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Time limit:</span>
                    <span className="font-medium">No limit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className="font-medium capitalize">{selectedDifficulty}</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-secondary-500 hover:bg-secondary-600" 
                disabled={selectedSubjects.length === 0}
                data-testid="button-start-quiz"
              >
                <Target className="h-4 w-4 mr-2" />
                Start Quiz
              </Button>
              
              <p className="text-xs text-gray-600 text-center mt-3">
                Average completion time: 8-10 minutes
              </p>
            </Card>
          </div>

          {/* Recent Attempts & Statistics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <CardContent className="pt-2">
                  <div className="text-2xl font-bold text-primary-600" data-testid="text-total-attempts">0</div>
                  <div className="text-sm text-gray-600">Total Attempts</div>
                </CardContent>
              </Card>
              <Card className="p-4 text-center">
                <CardContent className="pt-2">
                  <div className="text-2xl font-bold text-green-600" data-testid="text-average-score">0%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </CardContent>
              </Card>
              <Card className="p-4 text-center">
                <CardContent className="pt-2">
                  <div className="text-2xl font-bold text-blue-600" data-testid="text-best-score">0%</div>
                  <div className="text-sm text-gray-600">Best Score</div>
                </CardContent>
              </Card>
              <Card className="p-4 text-center">
                <CardContent className="pt-2">
                  <div className="text-2xl font-bold text-purple-600" data-testid="text-streak">0</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Quiz Attempts */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Quiz Attempts</h3>
              
              {attemptsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : quizAttempts && quizAttempts.length > 0 ? (
                <div className="space-y-4">
                  {quizAttempts.map((attempt: any, index: number) => (
                    <div key={attempt.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg" data-testid={`quiz-attempt-${index}`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          {attempt.score === attempt.totalQuestions ? (
                            <Trophy className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-primary-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {attempt.difficulty.charAt(0).toUpperCase() + attempt.difficulty.slice(1)} Quiz
                          </div>
                          <div className="text-sm text-gray-600">
                            {Array.isArray(attempt.subjects) ? attempt.subjects.length : 1} subjects • {formatTimeAgo(attempt.completedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(attempt.score, attempt.totalQuestions)}`}>
                          {attempt.score}/{attempt.totalQuestions}
                        </div>
                        <div className="text-sm text-gray-600">
                          {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No quiz attempts yet</p>
                  <p className="text-sm text-gray-500">Start your first quiz to see your performance here!</p>
                </div>
              )}
            </Card>

            {/* Quick Practice Options */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Practice</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="p-4 h-auto flex items-center space-x-3 hover:bg-gray-50"
                  data-testid="button-daily-practice"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Daily Practice</div>
                    <div className="text-sm text-gray-600">5 questions • Mixed topics</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="p-4 h-auto flex items-center space-x-3 hover:bg-gray-50"
                  data-testid="button-current-affairs-quiz"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Current Affairs</div>
                    <div className="text-sm text-gray-600">Latest news • 10 questions</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="p-4 h-auto flex items-center space-x-3 hover:bg-gray-50"
                  data-testid="button-weak-areas"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Weak Areas</div>
                    <div className="text-sm text-gray-600">Focus on improvement</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="p-4 h-auto flex items-center space-x-3 hover:bg-gray-50"
                  data-testid="button-random-quiz"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Random Quiz</div>
                    <div className="text-sm text-gray-600">Surprise yourself</div>
                  </div>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
