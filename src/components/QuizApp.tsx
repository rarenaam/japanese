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
  RotateCcw, Home, Clock, Sun, Moon 
} from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

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
          const validWords = results.data.filter((w: any) => 
            w.jp && typeof w.jp === 'string' && 
            w.nl && typeof w.nl === 'string'
          );

          if (validWords.length > 0) {
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

      <Card className="border-t-4 border-t-red-500 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Session Settings</CardTitle>
          <CardDescription>Configure how you want to learn today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg border border-dashed border-primary/20">
            <div className="p-2 bg-primary/10 rounded-full">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <Label htmlFor="csv-upload" className="cursor-pointer hover:underline">
                Upload woorden.csv (Optional)
              </Label>
              <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              <p className="text-xs text-muted-foreground">
                Currently using {allWords.length} built-in words
              </p>
            </div>
          </div>

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

          <div className="space-y-3">
            <Label>Categories (Leave empty for all)</Label>
            <ScrollArea className="h-40 w-full rounded-md border p-4 bg-secondary/10">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <div key={cat} className="flex items-center space-x-2">
                    <Checkbox id={`cat-${cat}`} checked={selectedCategories.includes(cat)} onCheckedChange={() => toggleCategory(cat)} />
                    <Label htmlFor={`cat-${cat}`} className="capitalize cursor-pointer text-sm">{cat}</Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {(selectedCategories.includes('hiragana alfabet') || selectedCategories.includes('katakana alfabet')) && (
             <div className="space-y-3 animate-fade-in-down">
               <Label className="text-primary">Specific Kana Rows (Optional)</Label>
               <div className="flex flex-wrap gap-2">
                 {KANA_ROWS.map(row => (
                   <div key={row} className="flex items-center space-x-2 bg-secondary/30 px-3 py-1 rounded-full">
                     <Checkbox id={`row-${row}`} checked={selectedRows.includes(row)} onCheckedChange={() => toggleRow(row)} />
                     <Label htmlFor={`row-${row}`} className="cursor-pointer uppercase text-xs">{row}</Label>
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
  const { activeQueue, currentIndex, settings, submitAnswer, resetQuiz } = useQuizStore();
  const [answer, setAnswer] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const currentWord = activeQueue[currentIndex];

  useEffect(() => {
    inputRef.current?.focus();
    setAnswer("");
  }, [currentIndex]);

  if (!currentWord) return null;
  const question = settings.direction === 'nl_jp' ? currentWord.nl : currentWord.jp;
  const progress = ((currentIndex) / activeQueue.length) * 100;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 max-w-xl mx-auto animate-fade-in">
      <div className="w-full mb-8 space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Word {currentIndex + 1} of {activeQueue.length}</span>
          <Badge variant={settings.mode === 'toets' ? 'destructive' : 'secondary'} className="capitalize">
            {settings.mode}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="w-full relative overflow-hidden border-2 border-primary/10 shadow-2xl bg-white/50 dark:bg-black/50 backdrop-blur-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500" />
        <CardContent className="pt-12 pb-8 px-6 text-center space-y-8">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground uppercase tracking-widest">
              Translate to {settings.direction === 'nl_jp' ? 'Japanese' : 'Dutch'}
            </p>
            <h2 className="text-5xl md:text-6xl font-black text-primary">{question}</h2>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); submitAnswer(answer); }} className="space-y-6">
            <Input 
              ref={inputRef} value={answer} onChange={(e) => setAnswer(e.target.value)} 
              placeholder="Type your answer..." className="text-center text-xl h-14" autoComplete="off" 
            />
            <Button type="submit" size="lg" className="w-32 bg-primary">Check <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-8">
        <Button variant="ghost" className="text-muted-foreground" onClick={resetQuiz}><XCircle className="mr-2 h-4 w-4" /> Quit Session</Button>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: RESULTS ---
const QuizResults = () => {
  const { results, resetQuiz, retryIncorrect } = useQuizStore();
  const correctCount = results.filter(r => r.isCorrect).length;
  const total = results.length;
  const score = Math.round((correctCount / total) * 100) || 0;

  return (
    <div className="max-w-3xl mx-auto p-4 animate-fade-in-up text-center space-y-8">
      <h1 className="text-3xl font-bold">Session Complete! {score}%</h1>
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={resetQuiz}><Home className="mr-2 h-4 w-4" /> Home</Button>
        {correctCount < total && <Button onClick={retryIncorrect}><RotateCcw className="mr-2 h-4 w-4" /> Retry Errors</Button>}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export const QuizApp = () => {
  const appState = useQuizStore((state) => state.appState);
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 relative">
      
      {/* DE DARKMODE TOGGLE */}
      <div className="absolute top-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full bg-background/50 backdrop-blur-sm border-2"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <div className="container mx-auto py-8">
        {appState === 'setup' && <QuizSetup />}
        {appState === 'quiz' && <QuizSession />}
        {appState === 'results' && <QuizResults />}
      </div>
    </div>
  );
};

export default QuizApp;
