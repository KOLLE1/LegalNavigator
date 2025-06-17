import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  BookOpen, 
  Scale, 
  Home, 
  Briefcase, 
  Users, 
  FileText,
  Eye,
  Clock,
  TrendingUp,
  ArrowRight,
  ChevronDown
} from "lucide-react";

export default function Knowledge() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    {
      id: "criminal",
      title: "Criminal Law",
      description: "Understanding criminal offenses, penalties, and legal procedures in Cameroon",
      icon: Scale,
      color: "bg-red-500",
      articles: 15,
      topics: ["Theft and robbery laws", "Assault and battery", "Criminal procedures"]
    },
    {
      id: "family",
      title: "Family Law", 
      description: "Marriage, divorce, inheritance, and family-related legal matters in Cameroon",
      icon: Home,
      color: "bg-blue-500",
      articles: 18,
      topics: ["Marriage requirements", "Divorce procedures", "Child custody laws"]
    },
    {
      id: "property",
      title: "Property Law",
      description: "Real estate, land ownership, and property rights in Cameroon",
      icon: Home,
      color: "bg-green-500", 
      articles: 12,
      topics: ["Land ownership laws", "Property registration", "Property disputes"]
    },
    {
      id: "business",
      title: "Business Law",
      description: "Corporate law, contracts, and commercial regulations in Cameroon",
      icon: Briefcase,
      color: "bg-purple-500",
      articles: 21,
      topics: ["Company registration", "Contract law", "Business licensing"]
    },
    {
      id: "employment",
      title: "Employment Law",
      description: "Worker rights, employment contracts, and labor disputes in Cameroon",
      icon: Users,
      color: "bg-orange-500",
      articles: 14,
      topics: ["Employment contracts", "Worker rights", "Termination laws"]
    },
    {
      id: "constitutional",
      title: "Constitutional Law",
      description: "Constitutional rights, government structure, and civil liberties in Cameroon",
      icon: FileText,
      color: "bg-indigo-500",
      articles: 9,
      topics: ["Fundamental rights", "Government powers", "Legal procedures"]
    }
  ];

  const popularArticles = [
    {
      title: "How to Register a Business in Cameroon",
      description: "Complete step-by-step guide to registering your business with the required documents and procedures.",
      views: "2.5k",
      readTime: "8 min",
      category: "Business Law"
    },
    {
      title: "Marriage Laws in Cameroon", 
      description: "Understanding marriage requirements, procedures, and legal implications in Cameroon.",
      views: "1.8k",
      readTime: "6 min",
      category: "Family Law"
    },
    {
      title: "Property Inheritance Rights",
      description: "Your rights to inherit property and the legal procedures involved in inheritance cases.",
      views: "3.2k", 
      readTime: "10 min",
      category: "Property Law"
    },
    {
      title: "Employment Rights & Obligations",
      description: "Understanding your rights as an employee and employer obligations under Cameroon labor law.",
      views: "2.1k",
      readTime: "7 min", 
      category: "Employment Law"
    }
  ];

  const recentUpdates = [
    {
      title: "New Marriage Law Amendments",
      description: "Updated requirements for marriage registration and documentation procedures.",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Employment Law Changes",
      description: "New regulations regarding minimum wage and working hours have been implemented.",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    }
  ];

  const faqs = [
    {
      question: "What documents do I need to start a business in Cameroon?",
      answer: "To start a business in Cameroon, you typically need: valid identification (national ID or passport), proof of address, business registration form, tax identification number application, and any required professional licenses depending on your business type."
    },
    {
      question: "How long does it take to get divorced in Cameroon?",
      answer: "The duration of divorce proceedings in Cameroon varies depending on the type of divorce and whether it's contested. An uncontested divorce can take 3-6 months, while contested divorces may take 1-2 years or longer."
    },
    {
      question: "What are my rights if I'm arrested in Cameroon?",
      answer: "If arrested in Cameroon, you have the right to remain silent, the right to legal representation, the right to be informed of charges against you, and the right to contact family or consular officials if you're a foreign national."
    },
    {
      question: "How do I legally buy property in Cameroon?",
      answer: "To legally buy property in Cameroon, ensure the seller has clear title, conduct due diligence, obtain a surveyor's report, draft a purchase agreement, pay applicable taxes and fees, and register the transfer with relevant authorities."
    },
    {
      question: "What should I do if my employer doesn't pay my salary?",
      answer: "If your employer fails to pay your salary, first try resolving it directly with your employer. If unsuccessful, file a complaint with the Ministry of Labor, document all evidence, and consider seeking legal assistance from a labor law attorney."
    }
  ];

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Legal Knowledge Base
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Comprehensive guides and resources on Cameroon law to help you understand your rights and legal obligations
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search legal topics, laws, procedures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-4 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Legal Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 ${category.color} rounded-lg`}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{category.articles} articles</p>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {category.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  {category.topics.map((topic, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                      {topic}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{category.articles} articles</span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Popular Articles */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Popular Articles</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {popularArticles.map((article, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                      {article.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {article.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {article.readTime} read
                        </div>
                      </div>
                      <Badge variant="secondary">{article.category}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Updates and FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Legal Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUpdates.map((update, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {update.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {update.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {update.date.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {faq.question}
                      </h4>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                        expandedFaq === index ? 'transform rotate-180' : ''
                      }`} />
                    </div>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
