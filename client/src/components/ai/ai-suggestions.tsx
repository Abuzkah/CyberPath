import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Brain, ChevronDown, ChevronUp, Clock, Target, Zap, BookOpen } from "lucide-react";
import { CURRENT_USER_ID } from "@/lib/constants";

interface AISuggestion {
  id: string;
  type: "module" | "tool" | "challenge" | "resource";
  title: string;
  description: string;
  reason: string;
  priority: "high" | "medium" | "low";
  category: string;
  estimatedTime?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export default function AISuggestions() {
  const [expanded, setExpanded] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const { data: suggestions = [], isLoading } = useQuery<AISuggestion[]>({
    queryKey: [`/api/ai/suggestions/${CURRENT_USER_ID}`],
    refetchInterval: 30000,
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-400/20 text-red-400 border-red-400/30";
      case "medium": return "bg-yellow-400/20 text-yellow-400 border-yellow-400/30";
      case "low": return "bg-green-400/20 text-green-400 border-green-400/30";
      default: return "bg-gray-400/20 text-gray-400 border-gray-400/30";
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-400";
      case "intermediate": return "text-yellow-400";
      case "advanced": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "module": return <BookOpen className="h-4 w-4" />;
      case "tool": return <Zap className="h-4 w-4" />;
      case "challenge": return <Target className="h-4 w-4" />;
      case "resource": return <Brain className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="terminal-window border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-400">
            <Brain className="mr-2 h-5 w-5 animate-pulse" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="terminal-window border-gray-700">
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer group">
              <CardTitle className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                <Brain className="mr-2 h-5 w-5" />
                AI Recommendations
                <Badge variant="outline" className="ml-2 text-xs border-blue-400/30 text-blue-400">
                  {suggestions.length}
                </Badge>
              </CardTitle>
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
              )}
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent>
            {suggestions.length === 0 ? (
              <div className="text-center py-6">
                <Brain className="mx-auto h-12 w-12 text-gray-500 mb-3" />
                <p className="text-gray-400">No recommendations yet. Complete more modules to get personalized suggestions!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedSuggestion === suggestion.id
                        ? "bg-gray-700/50 border-blue-400/50"
                        : "bg-gray-800/50 border-gray-600 hover:border-gray-500"
                    }`}
                    onClick={() => setSelectedSuggestion(
                      selectedSuggestion === suggestion.id ? null : suggestion.id
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="text-blue-400">
                          {getTypeIcon(suggestion.type)}
                        </div>
                        <h4 className="font-semibold text-white">{suggestion.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority}
                        </Badge>
                        {suggestion.difficulty && (
                          <Badge variant="outline" className={`border-gray-600 ${getDifficultyColor(suggestion.difficulty)}`}>
                            {suggestion.difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-2">{suggestion.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center">
                        <Target className="mr-1 h-3 w-3" />
                        {suggestion.category}
                      </span>
                      {suggestion.estimatedTime && (
                        <span className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {suggestion.estimatedTime}
                        </span>
                      )}
                    </div>
                    
                    {selectedSuggestion === suggestion.id && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-cyan-400 mb-1">Why this recommendation?</h5>
                          <p className="text-sm text-gray-300">{suggestion.reason}</p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-blue-400 text-black hover:bg-blue-500 text-xs">
                            Start Now
                          </Button>
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white text-xs">
                            Learn More
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Recommendations refresh automatically</span>
                    <div className="flex items-center text-blue-400">
                      <Brain className="mr-1 h-3 w-3" />
                      <span className="text-xs">Powered by AI</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}