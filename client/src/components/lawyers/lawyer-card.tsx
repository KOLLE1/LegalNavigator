import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Languages, CheckCircle } from "lucide-react";
import type { Lawyer } from "@/types";

interface LawyerCardProps {
  lawyer: Lawyer;
  onContact?: (lawyer: Lawyer) => void;
  onViewProfile?: (lawyer: Lawyer) => void;
}

export function LawyerCard({ lawyer, onContact, onViewProfile }: LawyerCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={lawyer.user.profileImageUrl} />
            <AvatarFallback className="text-lg">
              {lawyer.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {lawyer.user.name}
              </h3>
              {lawyer.verified && (
                <Badge variant="secondary" className="text-green-600 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {lawyer.specialization}
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {lawyer.experienceYears} years experience
            </p>
            
            <div className="flex items-center gap-1 mt-2">
              {renderStars(lawyer.rating)}
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                {lawyer.rating.toFixed(1)} ({lawyer.totalReviews} reviews)
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {lawyer.description}
        </p>

        {/* Practice areas */}
        <div className="flex flex-wrap gap-1 mb-4">
          {lawyer.practiceAreas.slice(0, 3).map((area) => (
            <Badge key={area} variant="outline" className="text-xs">
              {area}
            </Badge>
          ))}
          {lawyer.practiceAreas.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{lawyer.practiceAreas.length - 3} more
            </Badge>
          )}
        </div>

        {/* Location and languages */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{lawyer.user.location || 'Cameroon'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Languages className="h-4 w-4" />
            <span>{lawyer.languages.join(', ')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            onClick={() => onContact?.(lawyer)}
          >
            Contact
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onViewProfile?.(lawyer)}
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
