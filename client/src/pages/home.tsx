import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/layout/navigation";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { 
  BookOpen, 
  Clock, 
  Flame, 
  Play, 
  Bookmark, 
  StickyNote,
  Zap,
  Check,
  ScrollText,
  Globe,
  TrendingUp,
  Landmark,
  ChartLine
} from "lucide-react";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: featuredArticles, isLoading: articlesLoading } = useQuery({
    queryKey: ["/api/articles/featured"],
    retry: false,
  });

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["/api/subjects"],
    retry: false,
  });

  const { data: userProgress, isLoading: progressLoading, error: progressError } = useQuery({
    queryKey: ["/api/progress"],
    retry: false,
  });

  const { data: recentActivity, isLoading: activityLoading, error: activityError } = useQuery({
    queryKey: ["/api/activity"],
    retry: false,
  });

  const { data: bookmarks, error: bookmarksError } = useQuery({
    queryKey: ["/api/bookmarks"],
    retry: false,
  });

  const { data: notes, error: notesError } = useQuery({
    queryKey: ["/api/notes"],
    retry: false,
  });

  useEffect(() => {
    const errors = [progressError, activityError, bookmarksError, notesError].filter(Boolean);
    errors.forEach((error) => {
      if (error && isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    });
  }, [progressError, activityError, bookmarksError, notesError, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  const getSubjectIcon = (name: string) => {
    const iconMap: { [key: string]: any } = {
      'Indian Polity': Landmark,
      'Modern History': ScrollText,
      'Geography': Globe,
      'Economics': ChartLine,
    };
    return iconMap[name] || BookOpen;
  };

  const getActivityIcon = (activityType: string) => {
    const iconMap: { [key: string]: any } = {
      'quiz_completed': Check,
      'bookmark_added': Bookmark,
      'note_added': StickyNote,
      'study_progress': Clock,
    };
    return iconMap[activityType] || Check;
  };

  const getActivityColor = (activityType: string) => {
    const colorMap: { [key: string]: string } = {
      'quiz_completed': 'bg-green-100 text-green-600',
      'bookmark_added': 'bg-blue-100 text-blue-600',
      'note_added': 'bg-purple-100 text-purple-600',
      'study_progress': 'bg-yellow-100 text-yellow-600',
    };
    return colorMap[activityType] || 'bg-green-100 text-green-600';
  };

  const formatActivityDescription = (activity: any) => {
    switch (activity.activityType) {
      case 'quiz_completed':
        return `Completed quiz - Score: ${activity.metadata?.score}/${activity.metadata?.totalQuestions}`;
      case 'bookmark_added':
        return `Bookmarked ${activity.resourceType}`;
      case 'note_added':
        return `Added note to ${activity.resourceType}`;
      case 'study_progress':
        return `Studied for ${activity.metadata?.timeSpent} minutes`;
      default:
        return activity.activityType;
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Header */}
        <div className="md:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-primary-700">UPSC Prep Hub</h1>
            <div className="flex items-center space-x-3">
              <Button size="sm" variant="ghost" data-testid="button-search">
                <i className="fas fa-search text-lg"></i>
              </Button>
              <Button size="sm" variant="ghost" className="relative" data-testid="button-notifications">
                <i className="fas fa-bell text-lg"></i>
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-secondary-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg text-white p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold mb-2" data-testid="text-welcome">
                Good morning, {user?.firstName || 'Aspirant'}! 👋
              </h2>
              <p className="text-primary-100 mb-4">Ready to continue your UPSC journey?</p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Flame className="text-secondary-400 h-4 w-4" />
                  <span data-testid="text-streak">{user?.streakDays || 0}</span>
                  <span className="text-primary-100">day streak</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="text-secondary-400 h-4 w-4" />
                  <span data-testid="text-study-time">{Math.floor((user?.totalStudyMinutes || 0) / 60)}h {(user?.totalStudyMinutes || 0) % 60}m</span>
                  <span className="text-primary-100">total</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button
            variant="outline"
            className="bg-white p-4 h-auto flex flex-col items-center space-y-2 hover:shadow-lg transition-shadow"
            data-testid="button-daily-quiz"
          >
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Zap className="text-secondary-600 h-6 w-6" />
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">Daily Quiz</div>
              <div className="text-xs text-gray-600">5 questions ready</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="bg-white p-4 h-auto flex flex-col items-center space-y-2 hover:shadow-lg transition-shadow"
            data-testid="button-continue-study"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Play className="text-primary-600 h-6 w-6" />
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">Continue</div>
              <div className="text-xs text-gray-600">Indian Polity</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="bg-white p-4 h-auto flex flex-col items-center space-y-2 hover:shadow-lg transition-shadow"
            data-testid="button-bookmarks"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Bookmark className="text-yellow-600 h-6 w-6" />
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">Bookmarks</div>
              <div className="text-xs text-gray-600" data-testid="text-bookmark-count">
                {bookmarks?.length || 0} items
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="bg-white p-4 h-auto flex flex-col items-center space-y-2 hover:shadow-lg transition-shadow"
            data-testid="button-notes"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <StickyNote className="text-green-600 h-6 w-6" />
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">My Notes</div>
              <div className="text-xs text-gray-600" data-testid="text-notes-count">
                {notes?.length || 0} notes
              </div>
            </div>
          </Button>
        </div>

        {/* Current Affairs Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Today's Current Affairs</h2>
            <Button variant="link" className="text-primary-600 hover:text-primary-700" data-testid="button-view-all-articles">
              View All <i className="fas fa-arrow-right ml-2"></i>
            </Button>
          </div>

          {articlesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : featuredArticles && featuredArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article: any, index: number) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-article-${index}`}>
                  {article.imageUrl && (
                    <img src={article.imageUrl} alt={article.title} className="w-full h-32 object-cover" />
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {index === 0 && <Badge variant="secondary">FEATURED</Badge>}
                      <Badge variant="outline">Current Affairs</Badge>
                      <span className="text-gray-500 text-xs">{formatTimeAgo(article.publishedAt)}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2" data-testid={`text-article-title-${index}`}>
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2" data-testid={`text-article-summary-${index}`}>
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" className="h-6 p-1" data-testid={`button-bookmark-article-${index}`}>
                          <Bookmark className="h-3 w-3" />
                        </Button>
                        <span className="text-gray-500 text-xs">{article.readTime} min read</span>
                      </div>
                      <Button size="sm" variant="link" className="text-primary-600 hover:text-primary-700 h-auto p-0" data-testid={`button-read-article-${index}`}>
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <p className="text-gray-600">No featured articles available at the moment.</p>
                <p className="text-sm text-gray-500 mt-2">Check back later for the latest current affairs updates.</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Study Progress & Quick Practice */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Study Progress */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">This Week's Progress</h3>
                <Button variant="link" size="sm" data-testid="button-view-progress-details">View Details</Button>
              </div>
              
              {progressLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600" data-testid="text-questions-attempted">0</div>
                      <div className="text-xs text-gray-600">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600" data-testid="text-accuracy">0%</div>
                      <div className="text-xs text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary-600" data-testid="text-study-hours">
                        {Math.floor((user?.totalStudyMinutes || 0) / 60)}h
                      </div>
                      <div className="text-xs text-gray-600">Study Time</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {subjects && subjects.map((subject: any, index: number) => {
                      const progress = Math.floor(Math.random() * 100); // Mock progress for now
                      return (
                        <div key={subject.id} data-testid={`progress-subject-${index}`}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-700 font-medium">{subject.name}</span>
                            <span className="text-gray-600">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Quick Practice */}
          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Practice</h3>
              
              <div className="flex space-x-2 mb-4">
                <Button size="sm" className="flex-1" data-testid="button-difficulty-basic">Basic</Button>
                <Button size="sm" variant="outline" className="flex-1" data-testid="button-difficulty-advanced">Advanced</Button>
                <Button size="sm" variant="outline" className="flex-1" data-testid="button-difficulty-deep">Deep</Button>
              </div>

              <div className="space-y-2 mb-6">
                <label className="flex items-center" data-testid="checkbox-current-affairs">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <span className="ml-3 text-sm text-gray-700">Current Affairs</span>
                </label>
                <label className="flex items-center" data-testid="checkbox-polity">
                  <input type="checkbox" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <span className="ml-3 text-sm text-gray-700">Indian Polity</span>
                </label>
                <label className="flex items-center" data-testid="checkbox-history">
                  <input type="checkbox" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <span className="ml-3 text-sm text-gray-700">History</span>
                </label>
                <label className="flex items-center" data-testid="checkbox-geography">
                  <input type="checkbox" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <span className="ml-3 text-sm text-gray-700">Geography</span>
                </label>
              </div>

              <Button className="w-full bg-secondary-500 hover:bg-secondary-600 text-white" data-testid="button-start-quiz">
                Start 10-Question Quiz
              </Button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-600">Average time: 8 minutes</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Activity & Syllabus Preview */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {activityLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity: any, index: number) => {
                  const IconComponent = getActivityIcon(activity.activityType);
                  return (
                    <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${index}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${getActivityColor(activity.activityType)}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{formatActivityDescription(activity)}</p>
                        <p className="text-xs text-gray-600">{formatTimeAgo(activity.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No recent activity to show. Start studying to see your progress here!</p>
            )}
            <Button variant="link" className="w-full mt-4 text-primary-600 hover:text-primary-700" size="sm" data-testid="button-view-all-activity">
              View All Activity
            </Button>
          </Card>

          {/* Syllabus Quick Access */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Syllabus Overview</h3>
              <Button variant="link" size="sm" data-testid="button-view-all-syllabus">View All</Button>
            </div>
            
            {subjectsLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : subjects && subjects.length > 0 ? (
              <div className="space-y-3">
                {subjects.slice(0, 4).map((subject: any, index: number) => {
                  const IconComponent = getSubjectIcon(subject.name);
                  const completion = Math.floor(Math.random() * 100); // Mock completion for now
                  return (
                    <Button
                      key={subject.id}
                      variant="outline"
                      className="w-full p-3 h-auto flex items-center justify-between hover:bg-gray-50"
                      data-testid={`button-subject-${index}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 ${subject.color} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">{subject.name}</div>
                          <div className="text-xs text-gray-600">Progress: {completion}%</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-primary-600">{completion}%</div>
                        <i className="fas fa-chevron-right text-gray-400 text-xs mt-1"></i>
                      </div>
                    </Button>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No subjects available. Please contact support.</p>
            )}
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
