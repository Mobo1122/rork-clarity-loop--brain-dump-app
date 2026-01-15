import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface LoopIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function LoopIcon({ 
  size = 24, 
  color = '#00D9FF',
  strokeWidth = 2.5
}: LoopIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4C7.58 4 4 7.58 4 12C4 14.21 4.89 16.21 6.34 17.66L8.46 15.54C7.56 14.64 7 13.39 7 12C7 9.24 9.24 7 12 7C13.39 7 14.64 7.56 15.54 8.46L17.66 6.34C16.21 4.89 14.21 4 12 4Z"
        fill={color}
        opacity={0.3}
      />
      <Path
        d="M12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20C9.79 20 7.79 19.11 6.34 17.66"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M12 4C7.58 4 4 7.58 4 12C4 14.21 4.89 16.21 6.34 17.66"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="0 0"
      />
      <Path
        d="M6.34 17.66L4 20M6.34 17.66L8.68 20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
