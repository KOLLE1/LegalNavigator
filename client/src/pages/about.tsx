import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, MessageSquare, Users, Shield, Globe, Zap, CheckCircle, Star, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scale className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">LawHelp</span>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            About <span className="text-blue-600 dark:text-blue-400">LawHelp</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Your comprehensive legal assistant for Cameroon law. Get instant AI-powered guidance, 
            connect with verified lawyers, and access legal resources - all in one secure platform.
          </p>
          <Badge variant="secondary" className="text-lg py-2 px-4">
            Trusted by 1000+ Users in Cameroon
          </Badge>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <CardTitle>AI Legal Assistant</CardTitle>
              <CardDescription>
                Get instant answers to legal questions with our AI trained on Cameroon law
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  24/7 availability
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Bilingual support (English/French)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Instant legal guidance
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <CardTitle>Verified Lawyers</CardTitle>
              <CardDescription>
                Connect with licensed legal professionals across Cameroon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Background verified lawyers
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Specialized practice areas
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Transparent ratings & reviews
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your legal matters are protected with enterprise-grade security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  End-to-end encryption
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Attorney-client privilege
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  GDPR compliant
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How LawHelp Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sign Up</h3>
              <p className="text-gray-600 dark:text-gray-300">Create your secure account in minutes</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ask Questions</h3>
              <p className="text-gray-600 dark:text-gray-300">Chat with our AI or search for lawyers</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Get Guidance</h3>
              <p className="text-gray-600 dark:text-gray-300">Receive instant legal advice and resources</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Take Action</h3>
              <p className="text-gray-600 dark:text-gray-300">Connect with lawyers for complex matters</p>
            </div>
          </div>
        </div>

        {/* Practice Areas */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Legal Practice Areas
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "Family Law", "Criminal Law", "Business Law", "Property Law",
              "Employment Law", "Immigration", "Tax Law", "Civil Rights",
              "Contract Law", "Personal Injury", "Intellectual Property", "Administrative Law"
            ].map((area, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{area}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Why Choose LawHelp */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose LawHelp?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cameroon Law Expertise</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Specialized knowledge of Cameroon's legal system, from civil code to common law regions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Instant Responses</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Get immediate answers to urgent legal questions, available 24/7.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Star className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quality Assurance</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    All lawyers are verified and rated by real clients for your peace of mind.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Join thousands of Cameroonians who trust LawHelp for their legal needs.
              </p>
              <Link href="/">
                <Button className="w-full" size="lg">
                  Start Free Chat
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            Experience the Future of Legal Assistance
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Whether you need quick legal guidance or want to connect with a qualified lawyer, 
            LawHelp makes legal help accessible to everyone in Cameroon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="secondary" size="lg">
                Try AI Assistant
              </Button>
            </Link>
            <Link href="/lawyers">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                Find a Lawyer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}