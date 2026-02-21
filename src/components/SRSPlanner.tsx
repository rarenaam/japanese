import React from 'react';
import { useQuizStore } from '@/store/useQuizStore';
import { getWordId } from '@/lib/srs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Clock, 
  PlayCircle,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const SRSPlanner = () => {
  const { allWords, userProgress, startSRSReview, goToSetup } = useQuizStore();
  
  const now = Date.now();
  
  // Calculate Stats
  const totalWords = allWords.length;
  const startedWords = Object.keys(userProgress).length;
  const dueWords = allWords.filter(w => {
    const p = userProgress[getWordId(w)];
    return p && p.dueDate <= now;
  });
  
  const graduatedWords = Object.values(userProgress).filter(p => p.status === 'graduated').length;
  const learningWords = Object.values(userProgress).filter(p => p.status === 'learning').length;
  
  // Upcoming Reviews (next 7 days)
  const upcoming = allWords
    .filter(w => {
        const p = userProgress[getWordId(w)];
        return p && p.dueDate > now;
    })
    .sort((a, b) => userProgress[getWordId(a)].dueDate - userProgress[getWordId(b)].dueDate)
    .slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
            Smart Planner
          </h1>
          <p className="text-muted-foreground">
            Your long-term memory schedule. Optimized by Spaced Repetition.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={goToSetup}>
             Back to Menu
          </Button>
          <Button 
            size="lg" 
            onClick={startSRSReview}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
            disabled={dueWords.length === 0 && startedWords === totalWords}
          >
            <PlayCircle className="mr-2 h-5 w-5" /> 
            {dueWords.length > 0 ? `Review ${dueWords.length} Words` : 'Learn New Words'}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Today</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{dueWords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-green-50/50 dark:bg-green-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mastered</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">{graduatedWords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-orange-50/50 dark:bg-orange-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-full">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Learning</p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">{learningWords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-50/50 dark:bg-purple-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Progress</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                    {Math.round((startedWords / totalWords) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Chart / Visuals */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Vocabulary Retention</CardTitle>
            <CardDescription>Words by SRS Interval Stage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>New (Unseen)</span>
                    <span className="text-muted-foreground">{totalWords - startedWords} words</span>
                </div>
                <Progress value={((totalWords - startedWords) / totalWords) * 100} className="bg-secondary" />
             </div>
             
             <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-orange-600 font-medium">Learning (Short Term)</span>
                    <span className="text-muted-foreground">{learningWords} words</span>
                </div>
                <Progress value={(learningWords / totalWords) * 100} className="bg-secondary h-2" />
             </div>

             <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">Graduated (Long Term)</span>
                    <span className="text-muted-foreground">{graduatedWords} words</span>
                </div>
                <Progress value={(graduatedWords / totalWords) * 100} className="bg-secondary h-2" />
             </div>

             <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Review Schedule
                </h4>
                <p className="text-sm text-muted-foreground">
                    The planner automatically schedules words for review based on your performance.
                    Get a word right, and you'll see it less often. Get it wrong, and you'll see it tomorrow.
                </p>
             </div>
          </CardContent>
        </Card>

        {/* Upcoming List */}
        <Card className="md:col-span-1 flex flex-col h-[400px]">
            <CardHeader>
                <CardTitle>Upcoming</CardTitle>
                <CardDescription>Next 7 Days</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full px-6 pb-4">
                    {upcoming.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            No upcoming reviews scheduled.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcoming.map((w, i) => {
                                const p = userProgress[getWordId(w)];
                                const date = new Date(p.dueDate);
                                const days = Math.ceil((p.dueDate - now) / (1000 * 60 * 60 * 24));
                                
                                return (
                                    <div key={i} className="flex justify-between items-center pb-2 border-b last:border-0">
                                        <div>
                                            <p className="font-bold">{w.jp}</p>
                                            <p className="text-xs text-muted-foreground">{w.nl}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-mono bg-secondary px-2 py-1 rounded">
                                                {days === 0 ? 'Today' : `In ${days}d`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};
