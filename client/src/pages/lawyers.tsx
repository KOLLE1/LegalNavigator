import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LawyerCard } from "@/components/lawyers/lawyer-card";
import { Search, Filter, Users } from "lucide-react";
import type { Lawyer } from "@/types";

export default function Lawyers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    specialization: "",
    location: "",
    language: "",
    minRating: "",
  });

  // Fetch lawyers
  const { data: lawyers = [], isLoading: lawyersLoading } = useQuery({
    queryKey: ['lawyers', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await apiRequest('GET', `/api/lawyers?${params}`);
      return response.json();
    },
  });

  // Filter lawyers based on search term
  const filteredLawyers = lawyers.filter((lawyer: Lawyer) =>
    lawyer.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lawyer.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lawyer.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      specialization: "",
      location: "",
      language: "",
      minRating: "",
    });
    setSearchTerm("");
  };

  const handleContact = (lawyer: Lawyer) => {
    // Implement contact functionality
    console.log("Contact lawyer:", lawyer);
  };

  const handleViewProfile = (lawyer: Lawyer) => {
    // Implement view profile functionality
    console.log("View profile:", lawyer);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Lawyer Directory</h1>
          <p className="text-gray-600 dark:text-gray-400">Find qualified legal professionals in Cameroon</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search lawyers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" onClick={clearFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filters.specialization} onValueChange={(value) => handleFilterChange('specialization', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Specializations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Specializations</SelectItem>
                <SelectItem value="Criminal Law">Criminal Law</SelectItem>
                <SelectItem value="Family Law">Family Law</SelectItem>
                <SelectItem value="Property Law">Property Law</SelectItem>
                <SelectItem value="Business Law">Business Law</SelectItem>
                <SelectItem value="Employment Law">Employment Law</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cities</SelectItem>
                <SelectItem value="Yaoundé">Yaoundé</SelectItem>
                <SelectItem value="Douala">Douala</SelectItem>
                <SelectItem value="Bamenda">Bamenda</SelectItem>
                <SelectItem value="Garoua">Garoua</SelectItem>
                <SelectItem value="Bafoussam">Bafoussam</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.language} onValueChange={(value) => handleFilterChange('language', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Languages</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="Both">Both</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.minRating} onValueChange={(value) => handleFilterChange('minRating', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {lawyersLoading ? 'Loading...' : `Showing ${filteredLawyers.length} lawyers`}
          </p>
        </div>

        {lawyersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-80">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLawyers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLawyers.map((lawyer: Lawyer) => (
              <LawyerCard
                key={lawyer.id}
                lawyer={lawyer}
                onContact={handleContact}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No lawyers found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search criteria or filters to find more results.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {filteredLawyers.length > 9 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing 1-9 of {filteredLawyers.length} lawyers
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="default" size="sm">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
