import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Activity,
  Heart,
  Brain,
  BarChart3,
  PieChart,
  Calendar,
  Target
} from 'lucide-react';

const Analytics = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">AI-powered insights and predictive analytics for proactive care</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Patients</p>
                  <p className="text-3xl font-bold text-foreground">2,847</p>
                  <p className="text-sm text-success">+12% from last month</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Risk Score Improvement</p>
                  <p className="text-3xl font-bold text-foreground">23%</p>
                  <p className="text-sm text-success">Average across all patients</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Telehealth Adoption</p>
                  <p className="text-3xl font-bold text-foreground">67%</p>
                  <p className="text-sm text-success">+8% from last quarter</p>
                </div>
                <Activity className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Care Coordination</p>
                  <p className="text-3xl font-bold text-foreground">94%</p>
                  <p className="text-sm text-success">Cross-EHR success rate</p>
                </div>
                <Target className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="predictive" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="predictive">AI Predictive Models</TabsTrigger>
            <TabsTrigger value="population">Population Health</TabsTrigger>
            <TabsTrigger value="outcomes">Patient Outcomes</TabsTrigger>
            <TabsTrigger value="operations">Operational Metrics</TabsTrigger>
            <TabsTrigger value="financial">Financial Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="predictive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-primary" />
                    AI Risk Scoring Models
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">High Risk Patients</h4>
                        <span className="text-2xl font-bold text-destructive">23</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Patients with >80% risk score for hospitalization in next 30 days</p>
                    </div>
                    <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">Medium Risk Patients</h4>
                        <span className="text-2xl font-bold text-warning">67</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Patients requiring enhanced monitoring and care coordination</p>
                    </div>
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">Stable Patients</h4>
                        <span className="text-2xl font-bold text-success">2,757</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Patients with low risk scores and stable health metrics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Predictive Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: 'Diabetes Complications',
                        description: 'AI model predicts 15% reduction in complications with current treatment plans',
                        confidence: '92%',
                        trend: 'improving'
                      },
                      {
                        title: 'Medication Adherence',
                        description: 'Predictive alerts for patients at risk of medication non-compliance',
                        confidence: '87%',
                        trend: 'stable'
                      },
                      {
                        title: 'Care Gap Analysis',
                        description: 'Identification of patients overdue for preventive screenings',
                        confidence: '95%',
                        trend: 'improving'
                      }
                    ].map((insight, idx) => (
                      <div key={idx} className="p-3 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{insight.title}</h4>
                          <span className="text-sm font-medium text-primary">{insight.confidence}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AI Model Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">94.2%</p>
                    <p className="text-sm text-muted-foreground">Prediction Accuracy</p>
                    <p className="text-xs text-success mt-1">+2.3% improvement</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">87%</p>
                    <p className="text-sm text-muted-foreground">Early Detection Rate</p>
                    <p className="text-xs text-success mt-1">Critical conditions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">156</p>
                    <p className="text-sm text-muted-foreground">Prevented Admissions</p>
                    <p className="text-xs text-success mt-1">This quarter</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="population" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-primary" />
                    Condition Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { condition: 'Hypertension', percentage: 34, patients: 967 },
                      { condition: 'Diabetes Type 2', percentage: 28, patients: 797 },
                      { condition: 'Hyperlipidemia', percentage: 22, patients: 626 },
                      { condition: 'CAD', percentage: 16, patients: 455 }
                    ].map((item) => (
                      <div key={item.condition} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.condition}</span>
                          <span className="text-sm text-muted-foreground">{item.patients} patients</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Age Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { ageGroup: '18-30', percentage: 15, patients: 427 },
                      { ageGroup: '31-45', percentage: 25, patients: 712 },
                      { ageGroup: '46-60', percentage: 35, patients: 996 },
                      { ageGroup: '61+', percentage: 25, patients: 712 }
                    ].map((item) => (
                      <div key={item.ageGroup} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.ageGroup} years</span>
                          <span className="text-sm text-muted-foreground">{item.patients} patients</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Population Health Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Preventive Care Compliance</h4>
                    <p className="text-2xl font-bold text-foreground">78%</p>
                    <p className="text-sm text-muted-foreground">Up-to-date on screenings</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Medication Adherence</h4>
                    <p className="text-2xl font-bold text-foreground">85%</p>
                    <p className="text-sm text-muted-foreground">Overall compliance rate</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Care Plan Engagement</h4>
                    <p className="text-2xl font-bold text-foreground">92%</p>
                    <p className="text-sm text-muted-foreground">Active participation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outcomes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-primary" />
                    Clinical Outcomes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { metric: 'HbA1c Control (Diabetes)', target: '<7%', achievement: '73%', trend: '+5%' },
                      { metric: 'Blood Pressure Control', target: '<140/90', achievement: '81%', trend: '+8%' },
                      { metric: 'LDL Cholesterol Goals', target: '<100 mg/dL', achievement: '67%', trend: '+3%' },
                      { metric: 'BMI Improvement', target: '5% reduction', achievement: '45%', trend: '+12%' }
                    ].map((outcome) => (
                      <div key={outcome.metric} className="p-3 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{outcome.metric}</h4>
                          <span className="text-sm text-success">{outcome.trend}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Target: {outcome.target}</span>
                          <span className="font-medium">Achievement: {outcome.achievement}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Measures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { measure: 'Patient Satisfaction', score: '4.7/5', benchmark: '4.2/5' },
                      { measure: 'Readmission Rate', score: '8.2%', benchmark: '12.1%' },
                      { measure: 'Medication Errors', score: '0.3%', benchmark: '1.2%' },
                      { measure: 'Care Coordination Score', score: '94%', benchmark: '87%' }
                    ].map((quality) => (
                      <div key={quality.measure} className="p-3 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{quality.measure}</h4>
                          <span className="text-lg font-bold text-primary">{quality.score}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Benchmark: {quality.benchmark}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">96%</p>
                  <p className="text-sm text-muted-foreground">Appointment Fill Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Activity className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">18 min</p>
                  <p className="text-sm text-muted-foreground">Avg. Wait Time</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">142</p>
                  <p className="text-sm text-muted-foreground">Patients/Day</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">87%</p>
                  <p className="text-sm text-muted-foreground">Provider Utilization</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>EHR System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { system: 'Epic MyChart', uptime: '99.8%', syncTime: '2.3s', errors: '0.1%' },
                    { system: 'Cerner', uptime: '99.5%', syncTime: '3.1s', errors: '0.2%' },
                    { system: 'Athena', uptime: '99.2%', syncTime: '2.8s', errors: '0.3%' }
                  ].map((system) => (
                    <div key={system.system} className="p-4 border border-border rounded-lg">
                      <h4 className="font-medium text-foreground mb-3">{system.system}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Uptime:</span>
                          <span className="font-medium text-success">{system.uptime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sync Time:</span>
                          <span className="font-medium">{system.syncTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Error Rate:</span>
                          <span className="font-medium">{system.errors}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-2xl font-bold text-foreground">$2.4M</p>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-xs text-success mt-1">+8% vs last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-2xl font-bold text-foreground">94%</p>
                  <p className="text-sm text-muted-foreground">Collection Rate</p>
                  <p className="text-xs text-success mt-1">Above benchmark</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-2xl font-bold text-foreground">$156</p>
                  <p className="text-sm text-muted-foreground">Revenue Per Visit</p>
                  <p className="text-xs text-success mt-1">+$12 improvement</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-2xl font-bold text-foreground">18.2</p>
                  <p className="text-sm text-muted-foreground">Days in A/R</p>
                  <p className="text-xs text-success mt-1">-2.3 days improved</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;