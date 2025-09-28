import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Bot,
  Send,
  Minimize2,
  Maximize2,
  X,
  Info,
  MessageSquare,
  Lightbulb,
  FileText,
  Activity
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useNotifications } from '@/hooks/useNotifications';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface AugiAICopilotProps {
  className?: string;
}

const SAMPLE_SUGGESTIONS = [
  "Review high-risk patients",
  "Check pending lab results", 
  "Schedule follow-up appointments",
  "View today's patient list",
  "Generate care recommendations",
  "Check medication interactions"
];

export const AugiAICopilot: React.FC<AugiAICopilotProps> = ({ className = "" }) => {
  const { createNotification } = useNotifications();
  const [isClosed, setIsClosed] = useState(() => {
    return localStorage.getItem('augi-copilot-closed') === 'true';
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm AugiAI, your healthcare co-pilot. I can help you navigate patient care, review risk factors, and suggest next best actions. What would you like to explore today?",
      isUser: false,
      timestamp: new Date(),
      suggestions: SAMPLE_SUGGESTIONS.slice(0, 4)
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(text);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): Message => {
    const lowerInput = userInput.toLowerCase();
    
    let response = "I understand you're asking about " + userInput + ". ";
    let suggestions: string[] = [];

    if (lowerInput.includes('patient') || lowerInput.includes('review')) {
      response += "Based on your current patient data, I recommend focusing on the 3 high-risk patients who haven't been seen in the past 2 weeks. Would you like me to generate a priority list?";
      suggestions = ["Show high-risk patients", "Generate priority care list", "Check overdue appointments"];
    } else if (lowerInput.includes('lab') || lowerInput.includes('result')) {
      response += "You have 5 pending lab results that require review. 2 are from high-risk patients. Shall I prioritize these for you?";
      suggestions = ["Review pending labs", "Show critical results", "Check patient lab history"];
    } else if (lowerInput.includes('schedule') || lowerInput.includes('appointment')) {
      response += "Your schedule shows 3 optimal time slots for follow-ups this week. I can help prioritize which patients need immediate attention.";
      suggestions = ["View available slots", "Suggest patient priorities", "Check appointment conflicts"];
    } else if (lowerInput.includes('medication') || lowerInput.includes('drug')) {
      response += "I've analyzed potential drug interactions across your patient panel. There are 2 patients with potential contraindications that need review.";
      suggestions = ["Review drug interactions", "Check medication compliance", "View prescription history"];
    } else {
      response += "I can help you with patient care decisions, risk assessments, scheduling optimization, and care coordination. What specific area would you like to focus on?";
      suggestions = SAMPLE_SUGGESTIONS.slice(0, 4);
    }

    return {
      id: Date.now().toString(),
      text: response,
      isUser: false,
      timestamp: new Date(),
      suggestions
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleClose = async () => {
    setIsClosed(true);
    localStorage.setItem('augi-copilot-closed', 'true');
    
    // Create notification when co-pilot is closed
    await createNotification({
      type: 'info',
      title: 'AugiAI Co-pilot',
      message: 'AugiAI is available to help with patient care insights. Click to reopen.'
    });
  };

  const handleReopen = () => {
    setIsClosed(false);
    setIsMinimized(false);
    localStorage.setItem('augi-copilot-closed', 'false');
  };

  if (isClosed) {
    return null;
  };

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsMinimized(false)}
          className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          size="sm"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className={`shadow-2xl border-2 transition-all duration-300 ${
        isExpanded ? 'w-96 h-[600px]' : 'w-80 h-96'
      }`}>
        <CardHeader className="pb-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white/20 text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm font-semibold">AugiAI Co-pilot</CardTitle>
                <p className="text-xs opacity-90">Healthcare Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-white/20">
                    <Info className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>About AugiAI</DialogTitle>
                    <DialogDescription className="text-base">
                      AugiAI is a closed model which abstracts PHI, so it is completely secure. 
                      Augi can help you navigate Care, and give suggestions on the next best care steps!
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 w-7 p-0 hover:bg-white/20"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-7 w-7 p-0 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col h-full">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border/50'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    
                    {message.suggestions && !message.isUser && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="cursor-pointer hover:bg-background/80 text-xs"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border/50 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask AugiAI for care insights..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage(inputValue);
                  }
                }}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};