
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Calendar, FileText, Globe, ChevronDown, ChevronUp } from 'lucide-react';

interface ToolResult {
  id: string;
  tool: string;
  title: string;
  content: string;
  timestamp: Date;
}

export const ToolResults = () => {
  const [results, setResults] = useState<ToolResult[]>([
    {
      id: '1',
      tool: 'Wikipedia',
      title: 'Sample Wikipedia Search',
      content: 'This is where Wikipedia search results would appear when you ask me to search for information.',
      timestamp: new Date(),
    },
    {
      id: '2',
      tool: 'DuckDuckGo',
      title: 'Web Search Results',
      content: 'Web search results from DuckDuckGo would be displayed here in a structured format.',
      timestamp: new Date(),
    },
  ]);
  
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedResults(newExpanded);
  };

  const getToolIcon = (tool: string) => {
    switch (tool.toLowerCase()) {
      case 'wikipedia':
        return <FileText className="w-4 h-4" />;
      case 'duckduckgo':
        return <Search className="w-4 h-4" />;
      case 'calendar':
        return <Calendar className="w-4 h-4" />;
      case 'web':
        return <Globe className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getToolColor = (tool: string) => {
    switch (tool.toLowerCase()) {
      case 'wikipedia':
        return 'bg-blue-100 text-blue-800';
      case 'duckduckgo':
        return 'bg-orange-100 text-orange-800';
      case 'calendar':
        return 'bg-green-100 text-green-800';
      case 'web':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-[600px] bg-white/50 backdrop-blur-sm">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Tool Results</h3>
        <p className="text-sm text-gray-600">Recent tool executions and results</p>
      </div>
      
      <ScrollArea className="h-[calc(600px-80px)] p-4">
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tool results yet</p>
              <p className="text-xs">Results will appear here when you use tools</p>
            </div>
          ) : (
            results.map((result) => (
              <div key={result.id} className="border rounded-lg p-3 bg-white/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getToolColor(result.tool)}`}
                    >
                      {getToolIcon(result.tool)}
                      {result.tool}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(result.id)}
                    className="p-1 h-auto"
                  >
                    {expandedResults.has(result.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <h4 className="font-medium text-sm text-gray-900 mb-1">
                  {result.title}
                </h4>
                
                <div className={`text-xs text-gray-600 ${
                  expandedResults.has(result.id) ? '' : 'line-clamp-2'
                }`}>
                  {result.content}
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-2 border-t">
                  <span className="text-xs text-gray-500">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
