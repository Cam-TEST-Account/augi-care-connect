import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface ProgressIndicatorProps {
  value?: number;
  max?: number;
  loading?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value = 0,
  max = 100,
  loading = false,
  label,
  size = 'md',
  showPercentage = true,
}) => {
  const percentage = Math.round((value / max) * 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">
          {label || 'Loading...'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="font-medium">{percentage}%</span>
          )}
        </div>
      )}
      <Progress 
        value={percentage} 
        className={sizeClasses[size]} 
      />
    </div>
  );
};

export default ProgressIndicator;