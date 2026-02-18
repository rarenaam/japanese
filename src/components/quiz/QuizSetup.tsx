import React, { useState } from 'react';
import { useQuizStore } from '@/store/useQuizStore';
import { CATEGORIES, KANA_ROWS } from '@/lib/vocabulary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, BookOpen, GraduationCap } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';

export const QuizSetup = () => {
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
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          // Validate basic structure
          const first = results.data[0] as any;
          if ('jp' in first && 'nl' in first) {
             setAllWords(results.data as any[]);
             toast.success(`Loaded ${results.data.length} words from CSV!`);
          } else {
             toast.error("CSV format invalid. Needs 'jp' and 'nl' columns.");
          }
        }
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
