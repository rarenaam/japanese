import React, { useState, useRef, useEffect } from 'react';
import { useQuizStore } from '@/store/useQuizStore';
import { CATEGORIES, KANA_ROWS } from '@/lib/vocabulary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, BookOpen, GraduationCap, Lightbulb, 
  ArrowRight, HelpCircle, XCircle, CheckCircle2, 
  RotateCcw, Home, Clock 
} from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';

// --- SUB-COMPONENT: SETUP ---
const QuizSetup = () => {
  const { startQuiz, setAllWords, allWords } = useQuizStore();
  
  const [mode, setMode] = useState<'toets' | 'woorden'>('toets');
  const [direction, setDirection] = useState<'nl_jp' | 'jp_nl'>('nl_jp');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState<string>("10");
  const [isInfinite, setIsInfinite] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          // Filter out rows that are missing critical data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const validWords = results.data.filter((w: any) => 
            w.jp && typeof w.jp === 'string' && 
            w.nl && typeof w.nl === 'string'
          );

          if (validWords.length > 0) {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             setAllWords(validWords as any[]);
             toast.success(`Loaded ${validWords.length} valid words from CSV!`);
          } else {
             toast.error("No valid words found. CSV must have 'jp' and 'nl' columns.");
          }
        }
      },
      error: (error: Error) => {
        toast.error(`CSV Error: ${error.message}`);
      }
    });
  };

  const handleStart = () => {
    startQuiz({
      mode,
      direction,
      categories: selectedCategories,
      specificRows: selectedRows,
      wordCount: isInfinite ? 0 : parseInt(wordCount) || 10
    });
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleRow = (row: string) => {
    setSelectedRows(prev => 
      prev.includes(row) ? prev.filter(r => r !== row) : [...prev, row]
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 animate-fade-in-up">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-600">
          日本語 Vocabulary Trainer
        </h1>
        <p className="text-muted-foreground">
          Start your training session or upload your own word list.
        </p>
      </div>

      <Card className="border-t-4 border-t-red-500 shadow-lg">
        <CardHeader>
          <CardTitle>Session Settings</CardTitle>
          <CardDescription>Configure how you want to learn today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* File Upload */}
          <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg border border-dashed border-primary/20">
            <div className="p-2 bg-primary/10 rounded-full">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <Label htmlFor="csv-upload" className="cursor-pointer hover:underline">
                Upload woorden.csv (Optional)
              </Label>
              <Input 
                id="csv-upload" 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload} 
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Currently using {allWords.length} built-in words
              </p>
            </div>
          </div>

          {/* Mode & Direction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Game Mode</Label>
              <RadioGroup value={mode} onValueChange={(v: any) => setMode(v)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="toets" id="mode-test" />
                  <Label htmlFor="mode-test" className="flex items-center gap-2 cursor-pointer">
                    <GraduationCap className="h-4 w-4" /> Toets (Test)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="woorden" id="mode-study" />
                  <Label htmlFor="mode-study" className="flex items-center gap-2 cursor-pointer">
                    <BookOpen className="h-4 w-4" /> Woorden (Study)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Direction</Label>
              <RadioGroup value={direction} onValueChange={(v: any) => setDirection(v)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nl_jp" id="dir-nl-jp" />
                  <Label htmlFor="dir-nl-jp" className="cursor-pointer">NL ➔ JP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jp_nl" id="dir-jp-nl" />
                  <Label htmlFor="dir-jp-nl" className="cursor-pointer">JP ➔ NL</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Word Count */}
          <div className="space-y-3">
            <Label>Amount of Words</Label>
            <div className="flex items-center gap-4">
              <Input 
                type="number" 
                value={wordCount} 
                onChange={(e) => setWordCount(e.target.value)} 
                disabled={isInfinite}
                className="w-32"
              />
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="infinite" 
                  checked={isInfinite}
                  onCheckedChange={(c) => setIsInfinite(c === true)}
                />
                <Label htmlFor="infinite">All / Infinite</Label>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <Label>Categories (Leave empty for all)</Label>
            <ScrollArea className="h-40 w-full rounded-md border p-4 bg-secondary/10">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <div key={cat} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`cat-${cat}`} 
                      checked={selectedCategories.includes(cat)}
                      onCheckedChange={() => toggleCategory(cat)}
                    />
                    <Label htmlFor={`cat-${cat}`} className="capitalize cursor-pointer">
                      {cat}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Kana Rows (Conditional) */}
          {(selectedCategories.includes('hiragana alfabet') || selectedCategories.includes('katakana alfabet')) && (
             <div className="space-y-3 animate-fade-in-down">
               <Label className="text-primary">Specific Kana Rows (Optional)</Label>
               <div className="flex flex-wrap gap-2">
                 {KANA_ROWS.map(row => (
                   <div key={row} className="flex items-center space-x-2 bg-secondary/30 px-3 py-1 rounded-full">
                     <Checkbox 
                       id={`row-${row}`} 
                       checked={selectedRows.includes(row)}
                       onCheckedChange={() => toggleRow(row)}
                     />
                     <Label htmlFor={`row-${row}`} className="cursor-pointer uppercase">{row}</Label>
                   </div>
                 ))}
               </div>
             </div>
          )}

          <Button onClick={handleStart} className="w-full text-lg py-6 bg-gradient-to-r from-red-600 to-pink-600 hover:opacity-90 transition-opacity">
            Start {mode === 'toets' ? 'Test' : 'Session'}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};

// --- SUB-COMPONENT: SESSION ---
const QuizSession = () => {
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
    
    const target = settings.direction === 'nl_jp' ? currentWord.jp : currentWord.nl;
    const safeAnswer = (answer || "").toLowerCase().trim();
    const safeTarget = (target || "").toLowerCase().trim();
    const isCorrect = safeAnswer === safeTarget;

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
    const hint = currentWord.romaji || "";
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

// --- SUB-COMPONENT: RESULTS ---
const QuizResults = () => {
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

// --- MAIN COMPONENT ---
export const QuizApp = () => {
  const appState = useQuizStore((state) => state.appState);

  return (
    <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-500/10 via-background to-background">
      <div className="container mx-auto py-8">
        {appState === 'setup' && <QuizSetup />}
        {appState === 'quiz' && <QuizSession />}
        {appState === 'results' && <QuizResults />}
      </div>
    </div>
  );
};
