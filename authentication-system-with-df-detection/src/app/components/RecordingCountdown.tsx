/*
RecordingCountDown.tsx

Component used to add a timer to any sections that requires voice recording, so 
it can alert the users of how long they have to either record an audio sample or
say a set of phrases  

*/

"use client";

import { useEffect, useState } from "react";

interface RecordingCountdownProps {
  duration: number; // initial count in seconds
  active: boolean; // whether the countdown should be running
  onComplete?: () => void; // optional callback function when countdown finishes
}

export default function RecordingCountdown({
  duration,
  active,
  onComplete,
}: RecordingCountdownProps) {
  const [count, setCount] = useState(duration); // local state to track the countdown value

  useEffect(() => {
    if (!active) {
      // if countdown is not active, reset it to the original duration
      setCount(duration);
      return;
    }

    setCount(duration); // reset count to duration when re-activated

    // start countdown timer that ticks every second
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          // when it reaches 1 or less, stop the timer and call onComplete
          clearInterval(interval);
          onComplete?.(); // call the onComplete callback if it's defined
          return 0; // make sure count doesn’t go below 0
        }
        return prev - 1; // otherwise, keep decreasing the count
      });
    }, 1000);

    // cleanup the interval when component unmounts or dependencies change
    return () => clearInterval(interval);
  }, [active, duration, onComplete]);

  // don’t show anything if countdown isn’t active
  if (!active) return null;

  // render the countdown value
  return <span className="recording-countdown">{count}</span>;
}
