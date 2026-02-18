import React from 'react';
import { useQuizStore } from '@/store/useQuizStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, RotateCcw, Home, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const QuizResults = () => {
  const { results, resetQuiz, retryIncorrect, startTime } = useQuizStore();
  
  const correctCount = results.filter(r => r.isCorrect).length;
  const total = results.length;
  const score = Math.round((correctCount / total) * 100) || 0;
  const duration = (Date.now() - startTime) / 1000;
  const avgTime = duration / total;

  const getGradeColor = () => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const hasIncorrect = correctCount < total;

  return (
    <div className="max-w-3xl mx-auto p-4 animate-fade-in-up">
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Session Complete!</h1>
        <p className="text-muted-foreground">Here is how you performed.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="md:col-span-1 border-primary/20">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <div className={`text-4xl font-black ${getGradeColor()}`}>
                {score}%
              </div>
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="8" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="currentColor" 
                  className={getGradeColor()} 
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * score) / 100}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{correctCount} / {total}</p>
              <p className="text-sm text-muted-foreground">Correct Answers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="font-mono font-bold">{Math.floor(duration / 60)}m {Math.round(duration % 60)}s</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <Clock className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg per word</p>
                  <p className="font-mono font-bold">{avgTime.toFixed(1)}s</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accuracy</span>
                <span>{score}%</span>
              </div>
              <Progress value={score} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Correct List */}
        <Card className="h-[400px] flex flex-col border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <CheckCircle2 className="mr-2 h-5 w-5" /> Correct ({correctCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-6 pb-4">
              {results.filter(r => r.isCorrect).map((r, i) => (
                <div key={i} className="py-3 border-b last:border-0">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{r.word.jp}</span>
                    <span className="text-muted-foreground">{r.word.nl}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Answer: {r.userAnswer}</p>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Incorrect List */}
        <Card className="h-[400px] flex flex-col border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <XCircle className="mr-2 h-5 w-5" /> Incorrect ({total - correctCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-6 pb-4">
              {results.filter(r => !r.isCorrect).map((r, i) => (
                <div key={i} className="py-3 border-b last:border-0">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-red-600">{r.word.jp}</span>
                    <span className="text-muted-foreground">{r.word.nl}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-red-400">You: {r.userAnswer}</span>
                    <span className="text-green-600">Correct: {r.word.nl} / {r.word.jp}</span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button 
          variant="outline" 
          size="lg"
          onClick={resetQuiz}
          className="gap-2"
        >
          <Home className="h-4 w-4" /> Home
        </Button>
        
        {hasIncorrect && (
          <Button 
            size="lg" 
            onClick={retryIncorrect}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Retry Incorrect Words
          </Button>
        )}
      </div>
    </div>
  );
};
