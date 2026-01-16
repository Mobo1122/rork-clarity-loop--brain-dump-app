import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

interface LoopIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function LoopIcon({ 
  size = 24, 
  color,
  strokeWidth = 2.5
}: LoopIconProps) {
  const useGradient = !color;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="loopGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#00D9FF" stopOpacity="1" />
          <Stop offset="40%" stopColor="#00B8D9" stopOpacity="1" />
          <Stop offset="100%" stopColor="#0891B2" stopOpacity="0.7" />
        </LinearGradient>
      </Defs>
      <Path
        d="M12 2.5
           A9.5 9.5 0 0 1 21.5 12
           A9.5 9.5 0 0 1 12 21.5
           A9.5 9.5 0 0 1 2.5 12
           A9.5 9.5 0 0 1 10.5 2.7"
        stroke={useGradient ? "url(#loopGradient)" : color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
