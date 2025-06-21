
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { 
  Brain, 
  FileText, 
  Zap, 
  TrendingUp, 
  Calendar,
  Award,
  BookOpen,
  Target
} from "lucide-react";
import brainBitesLogo from "@assets/image_1750458395951.png";

interface DashboardStats {
  totalGenerations: number;
  flashcardsCount: number;
  quizzesCount: number;
  totalFiles: number;
  studyStreak: number;
  recentActivity: number;
  difficultyStats: {
    easy: number;
    medium: number;
    hard: number;
  };
  recentGenerations: Array<{
    id: number;
    type: string;
    title: string;
    difficulty: string;
    createdAt: string;
  }>;
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Please log in to view your dashboard.</p>
            <Button onClick={() => window.location.href = "/api/login"}>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalStudyMaterials = stats?.flashcardsCount + stats?.quizzesCount || 0;
  const difficultyTotal = stats?.difficultyStats.easy + stats?.difficultyStats.medium + stats?.difficultyStats.hard || 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  ← Back to Study
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Welcome back, {(user as any)?.firstName || 'Student'}!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Here's your learning progress overview
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Study Streak</p>
                  <p className="text-3xl font-bold text-blue-900">{stats?.studyStreak || 0}</p>
                  <p className="text-xs text-blue-600">days</p>
                </div>
                <Award className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Study Materials</p>
                  <p className="text-3xl font-bold text-green-900">{totalStudyMaterials}</p>
                  <p className="text-xs text-green-600">flashcards & quizzes</p>
                </div>
                <Brain className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Documents</p>
                  <p className="text-3xl font-bold text-purple-900">{stats?.totalFiles || 0}</p>
                  <p className="text-xs text-purple-600">uploaded</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">This Week</p>
                  <p className="text-3xl font-bold text-orange-900">{stats?.recentActivity || 0}</p>
                  <p className="text-xs text-orange-600">new materials</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Study Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Learning Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Flashcards Created</span>
                  <span>{stats?.flashcardsCount || 0}</span>
                </div>
                <Progress 
                  value={totalStudyMaterials > 0 ? (stats?.flashcardsCount / totalStudyMaterials) * 100 : 0} 
                  className="h-2" 
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Quizzes Created</span>
                  <span>{stats?.quizzesCount || 0}</span>
                </div>
                <Progress 
                  value={totalStudyMaterials > 0 ? (stats?.quizzesCount / totalStudyMaterials) * 100 : 0} 
                  className="h-2" 
                />
              </div>

              <div className="pt-4">
                <h4 className="text-sm font-medium mb-3">Difficulty Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Easy</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={(stats?.difficultyStats.easy / difficultyTotal) * 100} 
                        className="w-20 h-2" 
                      />
                      <span className="text-sm text-muted-foreground w-8">{stats?.difficultyStats.easy || 0}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={(stats?.difficultyStats.medium / difficultyTotal) * 100} 
                        className="w-20 h-2" 
                      />
                      <span className="text-sm text-muted-foreground w-8">{stats?.difficultyStats.medium || 0}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Hard</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={(stats?.difficultyStats.hard / difficultyTotal) * 100} 
                        className="w-20 h-2" 
                      />
                      <span className="text-sm text-muted-foreground w-8">{stats?.difficultyStats.hard || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentGenerations && stats.recentGenerations.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentGenerations.map((generation) => (
                    <div key={generation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-48">
                            {generation.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {generation.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {generation.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Link href={`/study/${generation.id}`}>
                        <Button size="sm" variant="ghost">
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <Link href="/">
                      <Button variant="outline" className="w-full">
                        View All Study Materials
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No recent study activity</p>
                  <Link href="/">
                    <Button>
                      <Zap className="h-4 w-4 mr-2" />
                      Create Study Materials
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-medium">Upload Document</h3>
                  <p className="text-sm text-muted-foreground">Add new study material</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-medium">Generate Flashcards</h3>
                  <p className="text-sm text-muted-foreground">Create new flashcards</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-medium">Take Quiz</h3>
                  <p className="text-sm text-muted-foreground">Test your knowledge</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
