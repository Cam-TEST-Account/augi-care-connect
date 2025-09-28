import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  TrendingUp, 
  Brain, 
  Heart, 
  Activity,
  Calendar,
  Target,
  Shield,
  Zap
} from 'lucide-react';

interface RiskFactor {
  name: string;
  currentRisk: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  impact: 'high' | 'medium' | 'low';
  recommendations: string[];
}

interface PredictiveRiskAnalysisProps {
  patientName?: string;
  overallRiskScore?: number;
}

export const PredictiveRiskAnalysis: React.FC<PredictiveRiskAnalysisProps> = ({ 
  patientName = "Patient",
  overallRiskScore = 72
}) => {
  const riskFactors: RiskFactor[] = [
    {
      name: 'Cardiovascular Disease',
      currentRisk: 68,
      trend: 'decreasing',
      impact: 'high',
      recommendations: [
        'Continue blood pressure medication',
        'Increase cardio exercise to 150 min/week',
        'Monitor sodium intake (<2300mg/day)'
      ]
    },
    {
      name: 'Type 2 Diabetes',
      currentRisk: 45,
      trend: 'stable',
      impact: 'medium',
      recommendations: [
        'Maintain current glucose monitoring',
        'Consider nutritionist consultation',
        'HbA1c test in 3 months'
      ]
    },
    {
      name: 'Hypertension Crisis',
      currentRisk: 82,
      trend: 'increasing',
      impact: 'high',
      recommendations: [
        'Urgent medication review needed',
        'Daily BP monitoring',
        'Stress management program'
      ]
    },
    {
      name: 'Sleep Apnea',
      currentRisk: 35,
      trend: 'decreasing',
      impact: 'medium',
      recommendations: [
        'Continue CPAP therapy',
        'Weight loss program',
        'Follow-up sleep study in 6 months'
      ]
    }
  ];

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return 'text-red-600 bg-red-50';
    if (risk >= 60) return 'text-orange-600 bg-orange-50';
    if (risk >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getRiskLevel = (risk: number) => {
    if (risk >= 80) return 'Critical';
    if (risk >= 60) return 'High';
    if (risk >= 40) return 'Medium';
    return 'Low';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge variant="destructive">High Impact</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Impact</Badge>;
      default:
        return <Badge variant="outline">Low Impact</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <Card className={`border-2 ${overallRiskScore >= 70 ? 'border-red-200' : overallRiskScore >= 50 ? 'border-yellow-200' : 'border-green-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI-Powered Risk Analysis - {patientName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className={`p-6 rounded-lg ${getRiskColor(overallRiskScore)}`}>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{overallRiskScore}%</div>
                  <div className="text-lg font-semibold">{getRiskLevel(overallRiskScore)} Risk</div>
                  <div className="text-sm opacity-80 mt-1">Overall Health Risk Score</div>
                </div>
                <div className="mt-4">
                  <Progress value={overallRiskScore} className="h-2" />
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="font-semibold">2</div>
                  <div className="text-sm text-muted-foreground">Improving Factors</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <div className="font-semibold">1</div>
                  <div className="text-sm text-muted-foreground">Critical Alerts</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-semibold">6</div>
                  <div className="text-sm text-muted-foreground">Action Items</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <Zap className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900">AI Insight</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Patient shows improving cardiovascular markers but requires immediate attention for 
                      blood pressure management. Recent wearable data indicates good exercise compliance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Factor Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskFactors.map((factor, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{factor.name}</h3>
                      {getTrendIcon(factor.trend)}
                      {getImpactBadge(factor.impact)}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Risk Level</span>
                          <span>{factor.currentRisk}%</span>
                        </div>
                        <Progress value={factor.currentRisk} className="h-2" />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(factor.currentRisk)}`}>
                        {getRiskLevel(factor.currentRisk)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Recommended Actions:</h4>
                  <ul className="space-y-1">
                    {factor.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictive Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Predictive Care Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border"></div>
              
              <div className="relative flex items-start space-x-4 pb-6">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-600">Immediate (Next 7 days)</h4>
                  <p className="text-sm text-muted-foreground">
                    Schedule urgent cardiology consultation for blood pressure management
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start space-x-4 pb-6">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-600">Short-term (2-4 weeks)</h4>
                  <p className="text-sm text-muted-foreground">
                    Begin structured exercise program and dietary modifications
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start space-x-4 pb-6">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-600">Medium-term (1-3 months)</h4>
                  <p className="text-sm text-muted-foreground">
                    Follow-up assessments and medication adjustments based on response
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-600">Long-term (3-6 months)</h4>
                  <p className="text-sm text-muted-foreground">
                    Expected 25-30% reduction in overall cardiovascular risk
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-2">
            <Button variant="default">
              Generate Care Plan
            </Button>
            <Button variant="outline">
              Schedule Interventions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};