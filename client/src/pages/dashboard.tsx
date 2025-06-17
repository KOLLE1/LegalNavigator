import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  CheckCircle, 
  Users, 
  Clock, 
  Plus,
  TrendingUp,
  Calendar,
  BookOpen,
  ArrowRight,
  Activity
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  // Fetch recent chat sessions
  const { data: chatSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/chat/sessions');
      return response.json();
    },
  });

  // Mock stats - in a real app, these would come from API
  const stats = {
    totalChats: chatSessions.length,
    resolvedCases: Math.floor(chatSessions.length * 0.75),
    lawyersContacted: 5,
    avgResponseTime: "2.5s"
  };

  const quickActions = [
    {
      title: "Start New Chat",
      description: "Get instant legal assistance",
      icon: Plus,
      href: "/chat",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Find Lawyers",
      description: "Browse verified legal professionals",
      icon: Users,
      href: "/lawyers",
      color: "bg-amber-600 hover:bg-amber-700",
    },
    {
      title: "Legal Resources",
      description: "Explore Cameroon law guides",
      icon: BookOpen,
      href: "/knowledge",
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  const recentUpdates = [
    {
      title: "New Business Law Amendment",
      description: "Recent changes to corporate registration requirements in Cameroon.",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      type: "info",
    },
    {
      title: "Property Rights Update",
      description: "New guidelines for property inheritance and transfer procedures.",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      type: "success",
    },
    {
      title: "Employment Law Changes",
      description: "Updated minimum wage and working hour regulations.",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      type: "warning",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Chats</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalChats}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved Cases</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.resolvedCases}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lawyers Contacted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.lawyersContacted}</p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.avgResponseTime}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Button 
                  className={`w-full h-auto p-6 ${action.color} text-white justify-start flex-col items-start gap-3`}
                  variant="default"
                >
                  <action.icon className="h-8 w-8" />
                  <div className="text-left">
                    <h4 className="font-semibold text-lg">{action.title}</h4>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity and Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Chat Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Chat Sessions
              </div>
              <Link href="/sessions">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : chatSessions.length > 0 ? (
              <div className="space-y-4">
                {chatSessions.slice(0, 3).map((session: any) => (
                  <div key={session.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {session.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(session.updatedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Link href={`/chat?session=${session.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">No chat sessions yet</p>
                <Link href="/chat">
                  <Button>Start Your First Chat</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legal Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Legal Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUpdates.map((update, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  update.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' :
                  update.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
                  'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                }`}>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {update.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {update.description}
                  </p>
                  <p className={`text-xs ${
                    update.type === 'info' ? 'text-blue-600 dark:text-blue-400' :
                    update.type === 'success' ? 'text-green-600 dark:text-green-400' :
                    'text-amber-600 dark:text-amber-400'
                  }`}>
                    {format(update.date, 'MMM d, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
