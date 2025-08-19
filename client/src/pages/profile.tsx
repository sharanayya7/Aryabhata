import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/layout/navigation";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { 
  User, 
  Settings, 
  BookOpen, 
  Target, 
  Clock, 
  Flame, 
  Award,
  LogOut,
  Bookmark,
  FileText,
  TrendingUp,
  Calendar
} from "lucide-react";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("overview");

  const { data: bookmarks, isLoading: bookmarksLoading } = useQuery({
    queryKey: ["/api/bookmarks"],
    retry: false,
  });

  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ["/api/notes"],
    retry: false,
  });

  const { data: quizAttempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ["/api/quiz/attempts"],
    retry: false,
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["/api/activity"],
    retry: false,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  const calculateStats = () => {
    const totalQuizzes = quizAttempts?.length || 0;
    const totalBookmarks = bookmarks?.length || 0;
    const totalNotes = notes?.length || 0;
    const totalStudyTime = user?.totalStudyMinutes || 0;
    const currentStreak = user?.streakDays || 0;

    let averageScore = 0;
    if (quizAttempts && quizAttempts.length > 0) {
      const totalPoints = quizAttempts.reduce((sum: number, attempt: any) => sum + attempt.score, 0);
      const totalQuestions = quizAttempts.reduce((sum: number, attempt: any) => sum + attempt.totalQuestions, 0);
      averageScore = totalQuestions > 0 ? Math.round((totalPoints / totalQuestions) * 100) : 0;
    }

    return {
      totalQuizzes,
      totalBookmarks,
      totalNotes,
      totalStudyTime: Math.floor(totalStudyTime / 60), // Convert to hours
      currentStreak,
      averageScore
    };
  };

  const stats = calculateStats();

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const formatJoinDate = (createdAt?: string) => {
    if (!createdAt) return 'Recently';
    const date = new Date(createdAt);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center" data-testid="stat-quizzes">
          <CardContent className="pt-2">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Target className="h-4 w-4 text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</div>
            <div className="text-xs text-gray-600">Quizzes Taken</div>
          </CardContent>
        </Card>
        <Card className="p-4 text-center" data-testid="stat-accuracy">
          <CardContent className="pt-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.averageScore}%</div>
            <div className="text-xs text-gray-600">Avg Accuracy</div>
          </CardContent>
        </Card>
        <Card className="p-4 text-center" data-testid="stat-streak">
          <CardContent className="pt-2">
            <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Flame className="h-4 w-4 text-secondary-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.currentStreak}</div>
            <div className="text-xs text-gray-600">Day Streak</div>
          </CardContent>
        </Card>
        <Card className="p-4 text-center" data-testid="stat-bookmarks">
          <CardContent className="pt-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Bookmark className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalBookmarks}</div>
            <div className="text-xs text-gray-600">Bookmarks</div>
          </CardContent>
        </Card>
        <Card className="p-4 text-center" data-testid="stat-notes">
          <CardContent className="pt-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalNotes}</div>
            <div className="text-xs text-gray-600">Notes</div>
          </CardContent>
        </Card>
        <Card className="p-4 text-center" data-testid="stat-study-time">
          <CardContent className="pt-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalStudyTime}h</div>
            <div className="text-xs text-gray-600">Study Time</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity: any, index: number) => (
                <div key={activity.id} className="flex items-center space-x-3 text-sm" data-testid={`activity-${index}`}>
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-gray-900">
                    {activity.activityType === 'quiz_completed' && `Completed a ${activity.metadata?.difficulty} quiz`}
                    {activity.activityType === 'bookmark_added' && `Bookmarked an ${activity.resourceType}`}
                    {activity.activityType === 'note_added' && `Added a note`}
                    {activity.activityType === 'study_progress' && `Studied for ${activity.metadata?.timeSpent} minutes`}
                  </span>
                  <span className="text-gray-500 ml-auto">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No recent activity to display.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderBookmarks = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">My Bookmarks</CardTitle>
      </CardHeader>
      <CardContent>
        {bookmarksLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : bookmarks && bookmarks.length > 0 ? (
          <div className="space-y-3">
            {bookmarks.map((bookmark: any, index: number) => (
              <div key={bookmark.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg" data-testid={`bookmark-${index}`}>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="capitalize">{bookmark.resourceType}</Badge>
                  <span className="text-sm text-gray-900">Resource ID: {bookmark.resourceId}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(bookmark.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No bookmarks yet. Start bookmarking articles and topics!</p>
        )}
      </CardContent>
    </Card>
  );

  const renderNotes = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">My Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {notesLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note: any, index: number) => (
              <div key={note.id} className="p-4 border border-gray-200 rounded-lg" data-testid={`note-${index}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">{note.resourceType}</Badge>
                    {note.title && <h4 className="font-medium text-gray-900">{note.title}</h4>}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">{note.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No notes yet. Start taking notes while studying!</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover"
                    data-testid="img-profile-picture"
                  />
                ) : (
                  <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white" data-testid="text-profile-initials">
                      {getInitials(user?.firstName, user?.lastName)}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900" data-testid="text-user-name">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.firstName || 'UPSC Aspirant'
                  }
                </h1>
                <p className="text-gray-600" data-testid="text-user-email">{user?.email || 'No email available'}</p>
                <p className="text-sm text-gray-500">
                  Member since {formatJoinDate(user?.createdAt)}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-primary-100 text-primary-700">
                    <Flame className="h-3 w-3 mr-1" />
                    {stats.currentStreak} day streak
                  </Badge>
                  {stats.averageScore >= 80 && (
                    <Badge className="bg-green-100 text-green-700">
                      <Award className="h-3 w-3 mr-1" />
                      High Performer
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("overview")}
            className="flex-1"
            data-testid="tab-overview"
          >
            <User className="h-4 w-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === "bookmarks" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("bookmarks")}
            className="flex-1"
            data-testid="tab-bookmarks"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmarks
          </Button>
          <Button
            variant={activeTab === "notes" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("notes")}
            className="flex-1"
            data-testid="tab-notes"
          >
            <FileText className="h-4 w-4 mr-2" />
            Notes
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && renderOverview()}
        {activeTab === "bookmarks" && renderBookmarks()}
        {activeTab === "notes" && renderNotes()}
      </main>

      <MobileNav />
    </div>
  );
}
