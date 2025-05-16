import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, color = 'black' }) => {
  return <Ionicons name={name} size={size} color={color} />;
};

export default Icon; 