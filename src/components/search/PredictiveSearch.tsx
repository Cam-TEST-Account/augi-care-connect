import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Users, Calendar, FileText, Stethoscope, Clock } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'patient' | 'appointment' | 'record' | 'provider';
  title: string;
  subtitle: string;
  metadata?: string;
  recent?: boolean;
}

interface PredictiveSearchProps {
  placeholder?: string;
  onSelect?: (result: SearchResult) => void;
  className?: string;
}

const PredictiveSearch: React.FC<PredictiveSearchProps> = ({
  placeholder = "Search patients, records, providers...",
  onSelect,
  className = "",
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'patient',
      title: 'Sarah Johnson',
      subtitle: 'Female, 45 years • High Risk',
      metadata: 'Last visit: 2 days ago',
      recent: true,
    },
    {
      id: '2',
      type: 'patient',
      title: 'Michael Chen',
      subtitle: 'Male, 32 years • Low Risk',
      metadata: 'Next appointment: Tomorrow',
    },
    {
      id: '3',
      type: 'appointment',
      title: 'Follow-up: Diabetes Management',
      subtitle: 'Tomorrow 2:00 PM • Dr. Smith',
      metadata: 'Room 204',
    },
    {
      id: '4',
      type: 'record',
      title: 'Lab Results - Complete Blood Count',
      subtitle: 'Sarah Johnson • Today',
      metadata: 'Critical values detected',
    },
    {
      id: '5',
      type: 'provider',
      title: 'Dr. Emily Rodriguez',
      subtitle: 'Endocrinologist • NPI: 1234567890',
      metadata: 'Available today',
    },
  ];

  // Simulate search with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      const filtered = mockResults.filter(
        result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.subtitle.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(filtered.length > 0);
      setSelectedIndex(0);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    setQuery(result.title);
    setIsOpen(false);
    onSelect?.(result);
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'patient':
        return <Users className="h-4 w-4" />;
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'record':
        return <FileText className="h-4 w-4" />;
      case 'provider':
        return <Stethoscope className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'patient':
        return 'text-blue-600';
      case 'appointment':
        return 'text-green-600';
      case 'record':
        return 'text-purple-600';
      case 'provider':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10"
          onFocus={() => query && setIsOpen(results.length > 0)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-auto">
          <CardContent className="p-0">
            {results.map((result, index) => (
              <div
                key={result.id}
                className={`flex items-center gap-3 p-3 cursor-pointer border-b last:border-b-0 ${
                  index === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
                onClick={() => handleSelect(result)}
              >
                <div className={getTypeColor(result.type)}>
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{result.title}</p>
                    {result.recent && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Recent
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {result.subtitle}
                  </p>
                  {result.metadata && (
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {result.metadata}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                  {result.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PredictiveSearch;