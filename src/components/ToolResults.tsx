
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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'duckduckgo':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'calendar':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'web':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-border">
      <div className="p-4 border-b border-border flex-shrink-0">
        <h3 className="text-lg font-semibold text-card-foreground">Tool Results</h3>
        <p className="text-sm text-muted-foreground">Recent tool executions and results</p>
      </div>
      
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tool results yet</p>
              <p className="text-xs">Results will appear here when you use tools</p>
            </div>
          ) : (
            results.map((result) => (
              <div key={result.id} className="border border-border rounded-lg p-3 bg-card/80">
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
                
                <h4 className="font-medium text-sm text-card-foreground mb-1">
                  {result.title}
                </h4>
                
                <div className={`text-xs text-muted-foreground ${
                  expandedResults.has(result.id) ? '' : 'line-clamp-2'
                }`}>
                  {result.content}
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">
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
