import React, { useState, useRef, useEffect } from 'react';
import { useQuizStore } from '@/store/useQuizStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, ArrowRight, XCircle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export const QuizSession = () => {
  const { 
    activeQueue, 
    currentIndex, 
    settings, 
    submitAnswer, 
    resetQuiz 
  } = useQuizStore();
  
  const [answer, setAnswer] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const currentWord = activeQueue[currentIndex];

  useEffect(() => {
    // Focus input on word change
    inputRef.current?.focus();
    setAnswer("");
  }, [currentIndex]);

  if (!currentWord) return null;

  const question = settings.direction === 'nl_jp' ? currentWord.nl : currentWord.jp;
  const progress = ((currentIndex) / activeQueue.length) * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    // Check locally for immediate feedback before submitting to store
    const target = settings.direction === 'nl_jp' ? currentWord.jp : currentWord.nl;
    const isCorrect = answer.toLowerCase().trim() === target.toLowerCase().trim();

    if (isCorrect) {
      toast.success("Correct! 🎉", { duration: 1500, position: 'top-center' });
    } else {
      toast.error(`Incorrect. It was: ${target}`, { duration: 3000, position: 'top-center' });
    }

    submitAnswer(answer);
  };

  const showHint = () => {
    if (settings.mode === 'toets') {
      toast.warning("No hints allowed in Test mode!");
      return;
    }
    const hint = settings.direction === 'nl_jp' ? currentWord.romaji : currentWord.romaji;
    toast.info(`Hint: ${hint.substring(0, 2)}...`, { position: 'bottom-center' });
  };

  const showHelp = () => {
    if (settings.mode === 'toets') {
      toast.warning("No help allowed in Test mode!");
      return;
    }
    const target = settings.direction === 'nl_jp' ? currentWord.jp : currentWord.nl;
    toast.info(`Answer: ${target}`, { position: 'bottom-center' });
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 max-w-xl mx-auto animate-fade-in">
      {/* Progress Header */}
      <div className="w-full mb-8 space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Word {currentIndex + 1} of {activeQueue.length}</span>
          <Badge variant={settings.mode === 'toets' ? 'destructive' : 'secondary'} className="capitalize">
            {settings.mode}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Card */}
      <Card className="w-full relative overflow-hidden border-2 border-primary/10 shadow-2xl bg-white/50 dark:bg-black/50 backdrop-blur-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500" />
        
        <CardContent className="pt-12 pb-8 px-6 text-center space-y-8">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground uppercase tracking-widest">
              Translate to {settings.direction === 'nl_jp' ? 'Japanese' : 'Dutch'}
            </p>
            <h2 className="text-5xl md:text-6xl font-black text-primary animate-scale-in">
              {question}
            </h2>
            {settings.mode === 'woorden' && (
              <p className="text-sm text-muted-foreground/50">
                Category: {currentWord.categorie}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative max-w-xs mx-auto">
              <Input
                ref={inputRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="text-center text-xl h-14 bg-background/80 shadow-inner"
                autoComplete="off"
              />
            </div>

            <div className="flex justify-center gap-3">
              <Button 
                type="button"
                variant="ghost"
                size="icon"
                onClick={showHint}
                title="Hint (Romaji)"
                disabled={settings.mode === 'toets'}
              >
                <Lightbulb className="h-5 w-5 text-yellow-500" />
              </Button>

              <Button 
                type="submit" 
                size="lg" 
                className="w-32 bg-primary hover:bg-primary/90"
              >
                Check <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button 
                type="button"
                variant="ghost"
                size="icon"
                onClick={showHelp}
                title="Show Answer"
                disabled={settings.mode === 'toets'}
              >
                <HelpCircle className="h-5 w-5 text-blue-500" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Button variant="ghost" className="text-muted-foreground" onClick={resetQuiz}>
          <XCircle className="mr-2 h-4 w-4" /> Quit Session
        </Button>
      </div>
    </div>
  );
};
