/* 
  utility generates a random passphrase using a pool of predefined words.
  It’s used for voice authentication prompts, ensuring each user gets a unique
  and pronounceable challenge phrase made up of real words.
*/

const sampleWords = [
  "banana",
  "river",
  "laptop",
  "mirror",
  "coffee",
  "jungle",
  "shadow",
  "pencil",
  "rocket",
  "garden",
  "thunder",
  "cloud",
  "window",
  "candle",
  "mountain",
  "whisper",
  "ocean",
  "storm",
  "planet",
  "sunset",
  "blanket",
  "library",
  "bottle",
  "glasses",
  "forest",
  "pillow",
  "umbrella",
  "wallet",
  "button",
  "camera",
  "island",
  "notebook",
  "lantern",
  "snowflake",
  "airplane",
  "diamond",
  "kitchen",
  "violin",
  "carpet",
  "penguin",
  "teacup",
  "backpack",
  "drawer",
  "eraser",
  "helmet",
  "jacket",
  "ladder",
  "necklace",
  "quartz",
  "zebra",
  "Audio",
  "Shield",
];

export function generatePassphrase(count: number = 5): string {
  // Shuffle the word list randomly
  const shuffled = [...sampleWords].sort(() => 0.5 - Math.random());

  // Take the first `count` words and join them into a space-separated string
  return shuffled.slice(0, count).join(" ");
}
