
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Zap } from 'lucide-react';

interface StatusBarProps {
  status: 'idle' | 'thinking' | 'working';
  lastToolUsed: string | null;
}

export const StatusBar = ({ status, lastToolUsed }: StatusBarProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'idle':
        return 'bg-green-500';
      case 'thinking':
        return 'bg-yellow-500';
      case 'working':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'Ready';
      case 'thinking':
        return 'Processing...';
      case 'working':
        return 'Using tools...';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="p-4 glass border-0 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} shadow-lg`} />
            <span className="text-sm font-medium text-foreground">
              {getStatusText()}
            </span>
          </div>
          {status === 'thinking' && (
            <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {lastToolUsed && (
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <Badge variant="secondary" className="text-xs glass border-0 shadow-md bg-gradient-to-r from-primary/20 to-accent/20">
                {lastToolUsed}
              </Badge>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </Card>
  );
};
