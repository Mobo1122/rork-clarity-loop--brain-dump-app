export interface Quote {
  text: string;
  author: string;
}

export const actionQuotes: Quote[] = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "Action is the foundational key to all success.",
    author: "Pablo Picasso"
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar"
  },
  {
    text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
    author: "Stephen King"
  },
  {
    text: "Done is better than perfect.",
    author: "Sheryl Sandberg"
  },
  {
    text: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu"
  },
  {
    text: "Do it now. Sometimes 'later' becomes 'never'.",
    author: "Anonymous"
  },
  {
    text: "If you spend too much time thinking about a thing, you'll never get it done.",
    author: "Bruce Lee"
  },
  {
    text: "Small deeds done are better than great deeds planned.",
    author: "Peter Marshall"
  },
  {
    text: "Every action you take is a vote for the type of person you wish to become.",
    author: "James Clear"
  },
  {
    text: "Think of many things; do one.",
    author: "Portuguese Proverb"
  },
  {
    text: "Action is the antidote to despair.",
    author: "Joan Baez"
  },
  {
    text: "You can't build a reputation on what you are going to do.",
    author: "Henry Ford"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    text: "Do something today that your future self will thank you for.",
    author: "Anonymous"
  }
];

export const clarityQuotes: Quote[] = [
  {
    text: "Muddy water is best cleared by leaving it alone.",
    author: "Alan Watts"
  },
  {
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius"
  },
  {
    text: "The answers you seek never come when the mind is busy, they come when the mind is still.",
    author: "Leon Brown"
  },
  {
    text: "Silence is a source of great strength.",
    author: "Lao Tzu"
  },
  {
    text: "All of humanity's problems stem from man's inability to sit quietly in a room alone.",
    author: "Blaise Pascal"
  },
  {
    text: "The quiet mind is richer than a crown.",
    author: "Robert Greene"
  },
  {
    text: "You are the stillness beneath the mental noise.",
    author: "Eckhart Tolle"
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci"
  },
  {
    text: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.",
    author: "Hermann Hesse"
  },
  {
    text: "Focus and simplicity... once you get there, you can move mountains.",
    author: "Steve Jobs"
  },
  {
    text: "To the mind that is still, the whole universe surrenders.",
    author: "Lao Tzu"
  },
  {
    text: "Adopt the pace of nature: her secret is patience.",
    author: "Ralph Waldo Emerson"
  },
  {
    text: "Silence is the sleep that nourishes wisdom.",
    author: "Francis Bacon"
  }
];

export function getRandomQuote(quotes: Quote[]): Quote {
  const index = Math.floor(Math.random() * quotes.length);
  return quotes[index];
}

export function getDailyQuote(quotes: Quote[]): Quote {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = dayOfYear % quotes.length;
  return quotes[index];
}

export function getRotatingQuote(quotes: Quote[], currentIndex: number): { quote: Quote; nextIndex: number } {
  const index = currentIndex % quotes.length;
  const nextIndex = (currentIndex + 1) % quotes.length;
  return { quote: quotes[index], nextIndex };
}
