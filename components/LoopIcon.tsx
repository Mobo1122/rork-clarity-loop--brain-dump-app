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
        d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M21 12C21 7.03 16.97 3 12 3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={0.4}
      />
      <Path
        d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M16 12C16 9.79 14.21 8 12 8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={0.4}
      />
    </Svg>
  );
}
