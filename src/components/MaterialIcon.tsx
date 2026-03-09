import React from 'react';
import { Text } from 'react-native';

// Fallback emoji mapping in case the library is not installed
const FallbackIcons: Record<string, string> = {
    'description': '📄',
    'inventory-2': '📦',
    'verified-user': '🛡️',
    'schedule': '🕒',
    'file-download': '📥',
    'cancel': '❌',
    'chevron-right': '›',
    'arrow-back': '←',
    'search': '🔍',
};

interface MaterialIconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
}

let MaterialIcons: any;

try {
    // Attempt to load the library
    const Icons = require('react-native-vector-icons/MaterialIcons');
    MaterialIcons = Icons.default || Icons;
    console.log('MaterialIcons loaded successfully');
} catch (e) {
    console.warn('MaterialIcons library not found, using emoji fallback');
    MaterialIcons = null;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({ name, size = 24, color = '#000', style }) => {
    if (MaterialIcons) {
        return <MaterialIcons name={name} size={size} color={color} style={style} />;
    }

    // Fallback to emoji
    return (
        <Text style={[{ fontSize: size, color: color }, style]}>
            {FallbackIcons[name] || '❓'}
        </Text>
    );
};
