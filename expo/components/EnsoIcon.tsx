import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  variant?: 'open' | 'closed' | 'incomplete';
  strokeWidth?: number;
  opacity?: number;
}

/**
 * EnsoIcon - A Zen-inspired loop icon
 *
 * The Enso (円相) is a circle hand-drawn in one brushstroke,
 * representing enlightenment, strength, and the acceptance
 * of imperfection. The gap in the circle symbolizes that
 * imperfection is an essential part of existence.
 *
 * Variants:
 * - 'open': Traditional enso with gap (for open loops)
 * - 'closed': Complete circle with slight brush variation (for completed loops)
 * - 'incomplete': Smaller arc (for in-progress states)
 */
export default function EnsoIcon({
  size = 24,
  color = '#2C2A26',
  variant = 'open',
  strokeWidth,
  opacity = 1,
}: Props) {
  const calculatedStrokeWidth = strokeWidth || size * 0.12;
  const center = size / 2;
  const radius = (size - calculatedStrokeWidth) / 2;

  // Create organic brush-like path variations
  const getPath = () => {
    switch (variant) {
      case 'closed':
        // Nearly complete circle with subtle brush character
        // Starts thick, thins slightly, ends with brush lift
        return `
          M ${center} ${calculatedStrokeWidth / 2}
          A ${radius} ${radius} 0 1 1 ${center - 0.5} ${calculatedStrokeWidth / 2}
        `;

      case 'incomplete':
        // Smaller arc for partial/in-progress states
        return `
          M ${center + radius * 0.7} ${center - radius * 0.7}
          A ${radius} ${radius} 0 0 1 ${center - radius * 0.7} ${center + radius * 0.7}
        `;

      case 'open':
      default:
        // Traditional enso with meaningful gap at top-right
        // Gap represents potential, openness, room for growth
        return `
          M ${center + radius * 0.85} ${center - radius * 0.5}
          A ${radius} ${radius} 0 1 1 ${center + radius * 0.5} ${center - radius * 0.85}
        `;
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="brushGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="50%" stopColor={color} stopOpacity={opacity * 0.95} />
            <Stop offset="100%" stopColor={color} stopOpacity={opacity * 0.85} />
          </LinearGradient>
        </Defs>
        <Path
          d={getPath()}
          stroke="url(#brushGradient)"
          strokeWidth={calculatedStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

// Smaller, simpler enso for inline use (like status indicators)
export function EnsoMini({
  size = 12,
  color = '#6B8E73',
  filled = false,
}: {
  size?: number;
  color?: string;
  filled?: boolean;
}) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {filled ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 1}
            fill={color}
          />
        ) : (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 1.5}
            stroke={color}
            strokeWidth={1.5}
            fill="none"
          />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
