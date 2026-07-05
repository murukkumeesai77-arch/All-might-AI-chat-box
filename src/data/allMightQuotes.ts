import { HeroQuote } from "../types";

export const ALL_MIGHT_QUOTES: HeroQuote[] = [
  {
    text: "I am here! (Watashi ga kita!)",
    situation: "His legendary reassurance to the world, bringing light and hope."
  },
  {
    text: "Go beyond... PLUS ULTRA!!!",
    situation: "The signature battle cry to shatter limits and conquer despair."
  },
  {
    text: "If you feel yourself hitting up against your limit, remember for what cause you clench your fists!",
    situation: "Encouraging Deku to find his inner strength."
  },
  {
    text: "The most bloated egos are often the most fragile. They are easily shattered.",
    situation: "A message on true humility and continuous learning."
  },
  {
    text: "A hero can always break through any obstacle! No matter how dark the path seems!",
    situation: "Inspiring hope in the darkest of situations."
  },
  {
    text: "You can become a hero. Yes, you can!",
    situation: "The emotional breakthrough moment with Young Midoriya."
  },
  {
    text: "It is fine now. Why? Because I am here!",
    situation: "Reassuring citizens in distress with a brilliant smile."
  },
  {
    text: "My power has been declining... but my soul remains the Symbol of Peace!",
    situation: "Standing strong against the greatest villains."
  }
];

export interface HeroAttribute {
  name: string;
  value: number;
  max: number;
  color: string;
}

export const ALL_MIGHT_ATTRIBUTES: HeroAttribute[] = [
  { name: "One For All Power", value: 100, max: 100, color: "bg-amber-500" },
  { name: "Charisma & Smile", value: 95, max: 100, color: "bg-red-500" },
  { name: "Speed / Smaash Power", value: 98, max: 100, color: "bg-blue-600" },
  { name: "Limit (Spark Remaining)", value: 75, max: 100, color: "bg-purple-600" }
];
