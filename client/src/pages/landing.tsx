import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuthModal } from "@/components/auth/auth-modal";
import { Link } from "wouter";
import { Scale, MessageSquare, Users, BookOpen, Shield, Zap } from "lucide-react";

export default function Landing() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const features = [
    {
      icon: MessageSquare,
      title: "AI Legal Assistant",
      description: "Get instant answers to your legal questions about Cameroon law from our specialized AI assistant."
    },
    {
      icon: Users,
      title: "Verified Lawyers",
      description: "Connect with qualified and verified legal professionals across Cameroon."
    },
    {
      icon: BookOpen,
      title: "Legal Knowledge Base",
      description: "Access comprehensive guides and resources on Cameroon law and legal procedures."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your conversations and data are protected with end-to-end encryption."
    },
    {
      icon: Zap,
      title: "Instant Responses",
      description: "Get legal guidance 24/7 with our AI assistant that never sleeps."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">LawHelp</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cameroon Legal Assistant</p>
              </div>
            </div>
            <Button onClick={() => setAuthModalOpen(true)}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your Trusted
            <span className="text-blue-600 dark:text-blue-400 block">
              Legal Assistant
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Get instant legal guidance for Cameroon law, connect with verified lawyers, 
            and access comprehensive legal resources - all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => setAuthModalOpen(true)}
            >
              Start Free Chat
            </Button>
            <Link href="/about">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need for Legal Guidance
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From AI-powered assistance to verified lawyer connections, we provide 
              comprehensive legal support for all Cameroonians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600 dark:bg-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Legal Help?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of Cameroonians who trust LawHelp for their legal needs.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-4"
            onClick={() => setAuthModalOpen(true)}
          >
            Start Your Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">LawHelp</span>
          </div>
          <p className="text-gray-400 mb-4">
            Democratizing legal access in Cameroon through AI and technology.
          </p>
          <p className="text-sm text-gray-500">
            © 2024 LawHelp. All rights reserved. This platform provides general legal information only.
          </p>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
