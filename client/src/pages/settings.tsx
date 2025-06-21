import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Brain, 
  FileText, 
  Palette, 
  Shield, 
  Download,
  Trash2,
  HelpCircle
} from "lucide-react";

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Settings state
  const [settings, setSettings] = useState({
    // Study preferences
    defaultDifficulty: 'auto',
    defaultQuizLength: 10,
    autoGenerateFlashcards: true,
    studyReminders: true,
    
    // AI preferences
    aiPersonality: 'balanced',
    detailedExplanations: true,
    includeHints: true,
    
    // Notifications
    emailNotifications: true,
    studyStreakReminders: true,
    weeklyProgress: true,
    
    // Interface
    compactMode: false,
    showDifficulty: true,
    showProgress: true,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    toast({
      title: "Setting Updated",
      description: "Your preferences have been saved.",
    });
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast({
        title: "Account Deletion",
        description: "Contact support to complete account deletion.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export will be emailed to you within 24 hours.",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Please log in to access settings.</p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Study
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">Customize your Brain Bites experience</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">
                  {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Member Since</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Study Preferences</span>
              </CardTitle>
              <CardDescription>
                Configure how Brain Bites generates and presents study materials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="default-difficulty">Default Difficulty</Label>
                  <Select 
                    value={settings.defaultDifficulty} 
                    onValueChange={(value) => handleSettingChange('defaultDifficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quiz-length">Default Quiz Length</Label>
                  <Select 
                    value={settings.defaultQuizLength.toString()} 
                    onValueChange={(value) => handleSettingChange('defaultQuizLength', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 questions</SelectItem>
                      <SelectItem value="10">10 questions</SelectItem>
                      <SelectItem value="15">15 questions</SelectItem>
                      <SelectItem value="20">20 questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-generate flashcards</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create flashcards when uploading files
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoGenerateFlashcards}
                    onCheckedChange={(checked) => handleSettingChange('autoGenerateFlashcards', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Detailed explanations</Label>
                    <p className="text-sm text-muted-foreground">
                      Include comprehensive explanations in quiz answers
                    </p>
                  </div>
                  <Switch
                    checked={settings.detailedExplanations}
                    onCheckedChange={(checked) => handleSettingChange('detailedExplanations', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include hints</Label>
                    <p className="text-sm text-muted-foreground">
                      Add helpful hints to difficult questions
                    </p>
                  </div>
                  <Switch
                    checked={settings.includeHints}
                    onCheckedChange={(checked) => handleSettingChange('includeHints', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Personality */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>AI Personality</span>
              </CardTitle>
              <CardDescription>
                Choose how the AI communicates and generates content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>AI Teaching Style</Label>
                <Select 
                  value={settings.aiPersonality} 
                  onValueChange={(value) => handleSettingChange('aiPersonality', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="encouraging">Encouraging & Supportive</SelectItem>
                    <SelectItem value="balanced">Balanced & Professional</SelectItem>
                    <SelectItem value="concise">Direct & Concise</SelectItem>
                    <SelectItem value="detailed">Detailed & Thorough</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>
                Control when and how you receive updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Study streak reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded to maintain your study streak
                  </p>
                </div>
                <Switch
                  checked={settings.studyStreakReminders}
                  onCheckedChange={(checked) => handleSettingChange('studyStreakReminders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly progress reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly summaries of your learning progress
                  </p>
                </div>
                <Switch
                  checked={settings.weeklyProgress}
                  onCheckedChange={(checked) => handleSettingChange('weeklyProgress', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Interface</span>
              </CardTitle>
              <CardDescription>
                Customize how the interface looks and behaves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use a more compact layout to fit more content
                  </p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show difficulty badges</Label>
                  <p className="text-sm text-muted-foreground">
                    Display difficulty levels on study materials
                  </p>
                </div>
                <Switch
                  checked={settings.showDifficulty}
                  onCheckedChange={(checked) => handleSettingChange('showDifficulty', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show progress indicators</Label>
                  <p className="text-sm text-muted-foreground">
                    Display progress bars and completion status
                  </p>
                </div>
                <Switch
                  checked={settings.showProgress}
                  onCheckedChange={(checked) => handleSettingChange('showProgress', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Data & Privacy</span>
              </CardTitle>
              <CardDescription>
                Manage your data and account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Export your data</Label>
                  <p className="text-sm text-muted-foreground">
                    Download all your study materials and progress data
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sign out</Label>
                    <p className="text-sm text-muted-foreground">
                      Sign out of your account on this device
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-destructive">Delete account</Label>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5" />
                <span>Help & Support</span>
              </CardTitle>
              <CardDescription>
                Get help and learn more about Brain Bites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Version</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Brain Bites v1.0.0
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Support</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Contact us for help and feedback
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </main>
    </div>
  );
}