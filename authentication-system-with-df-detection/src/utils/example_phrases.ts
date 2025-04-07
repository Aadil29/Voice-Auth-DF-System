const sampleWords = [
    "banana", "river", "laptop", "mirror", "coffee", "jungle",
    "rocket", "yellow", "garden", "penguin", "car", "purple",
    "guitar", "planet", "dragon", "kitten", "sunset", "forest",
    "map","arsenal","liverpool","brighton","chelsea"
  ];
  
  export function generatePassphrase(count: number = 3): string {
    const shuffled = sampleWords.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).join(" ");
  }
  