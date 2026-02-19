import { Word } from "@/types/quiz";

// Sample data to get started immediately without CSV upload
export const INITIAL_VOCABULARY: Word[] = [
  // Hiragana Basic
  { jp: "あ", nl: "a", romaji: "a", categorie: "hiragana alfabet", taal: "hiragana", hoofdklank: "a" },
  { jp: "い", nl: "i", romaji: "i", categorie: "hiragana alfabet", taal: "hiragana", hoofdklank: "a" },
  { jp: "う", nl: "u", romaji: "u", categorie: "hiragana alfabet", taal: "hiragana", hoofdklank: "a" },
  { jp: "え", nl: "e", romaji: "e", categorie: "hiragana alfabet", taal: "hiragana", hoofdklank: "a" },
  { jp: "お", nl: "o", romaji: "o", categorie: "hiragana alfabet", taal: "hiragana", hoofdklank: "a" },
  { jp: "か", nl: "ka", romaji: "ka", categorie: "hiragana alfabet", taal: "hiragana", hoofdklank: "ka" },
  
  // Katakana Basic
  { jp: "ア", nl: "a", romaji: "a", categorie: "katakana alfabet", taal: "katakana", hoofdklank: "a" },
  { jp: "カ", nl: "ka", romaji: "ka", categorie: "katakana alfabet", taal: "katakana", hoofdklank: "ka" },

  // Basic Vocab - Greeting
  { jp: "こんにちは", nl: "hallo", romaji: "konnichiwa", categorie: "groeten", taal: "jp", hoofdklank: "" },
  { jp: "さようなら", nl: "tot ziens", romaji: "sayounara", categorie: "groeten", taal: "jp", hoofdklank: "" },
  { jp: "ありがとう", nl: "dankjewel", romaji: "arigatou", categorie: "groeten", taal: "jp", hoofdklank: "" },

  // Food
  { jp: "りんご", nl: "appel", romaji: "ringo", categorie: "voedsel", taal: "jp", hoofdklank: "" },
  { jp: "みず", nl: "water", romaji: "mizu", categorie: "drinken", taal: "jp", hoofdklank: "" },
  { jp: "パン", nl: "brood", romaji: "pan", categorie: "voedsel", taal: "jp", hoofdklank: "" },
  
  // Animals
  { jp: "ねこ", nl: "kat", romaji: "neko", categorie: "natuur", taal: "jp", hoofdklank: "" },
  { jp: "いぬ", nl: "hond", romaji: "inu", categorie: "natuur", taal: "jp", hoofdklank: "" },
];

export const CATEGORIES = [
  "drinken", "voedsel", "lichaam", "literatuur", "emotie", 
  "school", "cultuur", "natuur", "transport", "kleding", 
  "sport", "groeten", "familie", "tijd", "katakana", 
  "hiragana", "alfabet", "katakana alfabet", "hiragana alfabet", "overig"
];

export const KANA_ROWS = ["a", "ka", "sa", "ta", "na", "ma", "ha", "wa", "ra", "ya"];
