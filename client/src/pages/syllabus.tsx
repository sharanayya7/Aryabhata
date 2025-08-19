import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/layout/navigation";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ChevronDown, ChevronRight, BookOpen, ScrollText, Globe, Landmark, ChartLine } from "lucide-react";

export default function Syllabus() {
  const [openSubjects, setOpenSubjects] = useState<Set<string>>(new Set());

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["/api/subjects"],
    retry: false,
  });

  const { data: userProgress } = useQuery({
    queryKey: ["/api/progress"],
    retry: false,
  });

  const toggleSubject = (subjectId: string) => {
    const newOpenSubjects = new Set(openSubjects);
    if (newOpenSubjects.has(subjectId)) {
      newOpenSubjects.delete(subjectId);
    } else {
      newOpenSubjects.add(subjectId);
    }
    setOpenSubjects(newOpenSubjects);
  };

  const getSubjectIcon = (name: string) => {
    const iconMap: { [key: string]: any } = {
      'Indian Polity': Landmark,
      'Modern History': ScrollText,
      'Geography': Globe,
      'Economics': ChartLine,
    };
    return iconMap[name] || BookOpen;
  };

  const getSubjectProgress = (subjectId: string) => {
    // Mock progress calculation
    return Math.floor(Math.random() * 100);
  };

  const getSubjectTopics = (subjectId: string) => {
    // Mock topics data
    const topicsMap: { [key: string]: any[] } = {
      'subject1': [
        { id: '1', title: 'Constitutional Framework', description: 'Basic structure and amendments', completion: 85 },
        { id: '2', title: 'Union Government', description: 'Executive, Legislature, Judiciary', completion: 70 },
        { id: '3', title: 'State Government', description: 'Governor, Chief Minister, Assembly', completion: 60 },
        { id: '4', title: 'Local Government', description: 'Panchayati Raj and Urban Bodies', completion: 40 },
      ],
      'subject2': [
        { id: '5', title: 'Freedom Struggle', description: 'National movement phases', completion: 75 },
        { id: '6', title: 'Colonial Economy', description: 'Economic impact of British rule', completion: 55 },
        { id: '7', title: 'Social Reform', description: '19th century reform movements', completion: 65 },
      ],
      'subject3': [
        { id: '8', title: 'Physical Geography', description: 'Landforms and climate', completion: 80 },
        { id: '9', title: 'Human Geography', description: 'Population and settlements', completion: 45 },
        { id: '10', title: 'Economic Geography', description: 'Resources and industries', completion: 70 },
      ],
      'subject4': [
        { id: '11', title: 'Indian Economy', description: 'Structure and development', completion: 50 },
        { id: '12', title: 'Economic Planning', description: 'Five year plans', completion: 35 },
        { id: '13', title: 'Public Finance', description: 'Budget and fiscal policy', completion: 25 },
      ],
    };
    return topicsMap[subjectId] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">UPSC Syllabus</h1>
          <p className="text-gray-600">Comprehensive breakdown of the UPSC Civil Services syllabus with your progress tracking</p>
        </div>

        {/* Overall Progress */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Overall Progress</h2>
            <span className="text-2xl font-bold text-primary-600" data-testid="text-overall-progress">68%</span>
          </div>
          <Progress value={68} className="h-3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600" data-testid="text-completed-topics">28</div>
              <div className="text-sm text-gray-600">Completed Topics</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600" data-testid="text-in-progress-topics">12</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600" data-testid="text-remaining-topics">15</div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600" data-testid="text-total-topics">55</div>
              <div className="text-sm text-gray-600">Total Topics</div>
            </div>
          </div>
        </Card>

        {/* Subjects */}
        <div className="space-y-6">
          {subjectsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : subjects && subjects.length > 0 ? (
            subjects.map((subject: any, index: number) => {
              const IconComponent = getSubjectIcon(subject.name);
              const progress = getSubjectProgress(subject.id);
              const topics = getSubjectTopics(subject.id);
              const isOpen = openSubjects.has(subject.id);

              return (
                <Card key={subject.id} className="overflow-hidden" data-testid={`card-subject-${index}`}>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full p-6 h-auto flex items-center justify-between hover:bg-gray-50"
                        onClick={() => toggleSubject(subject.id)}
                        data-testid={`button-toggle-subject-${index}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-primary-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                            <p className="text-sm text-gray-600">{subject.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm font-medium text-primary-600">{progress}% Complete</span>
                              <span className="text-sm text-gray-500">{topics.length} topics</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="w-16 mb-2">
                              <Progress value={progress} className="h-2" />
                            </div>
                            <span className="text-sm font-medium text-gray-600">{progress}%</span>
                          </div>
                          {isOpen ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-6 pb-6">
                        <div className="border-t pt-4">
                          <div className="grid gap-3">
                            {topics.map((topic: any, topicIndex: number) => (
                              <Button
                                key={topic.id}
                                variant="outline"
                                className="p-4 h-auto flex items-center justify-between hover:bg-gray-50"
                                data-testid={`button-topic-${index}-${topicIndex}`}
                              >
                                <div className="text-left flex-1">
                                  <div className="font-medium text-gray-900">{topic.title}</div>
                                  <div className="text-sm text-gray-600">{topic.description}</div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="text-right">
                                    <div className="w-12 mb-1">
                                      <Progress value={topic.completion} className="h-1" />
                                    </div>
                                    <span className="text-xs text-gray-500">{topic.completion}%</span>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No syllabus subjects available.</p>
                <p className="text-sm text-gray-500 mt-2">Please contact support to add syllabus content.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
