export interface ColorGradient {
    id: string;
    name: string;
    start: string;
    end: string;
    mid?: string; // Optional middle color for 3-color gradients
}

export const gradientPalettes: ColorGradient[] = [
    {
        id: 'golden',
        name: 'Golden Depths',
        start: '#FFD700',
        mid: '#FF8C00',
        end: '#8B4513'
    },
    {
        id: 'sunset',
        name: 'Sunset Dream',
        start: '#FF6B6B',
        end: '#FFD93D'
    },
    {
        id: 'ocean',
        name: 'Ocean Depths',
        start: '#4ECDC4',
        end: '#1A535C'
    },
    {
        id: 'aurora',
        name: 'Aurora Borealis',
        start: '#B084CC',
        end: '#87E0C4'
    },
    {
        id: 'ember',
        name: 'Ember Glow',
        start: '#F72585',
        end: '#FF9E00'
    },
    {
        id: 'galaxy',
        name: 'Galaxy Night',
        start: '#7209B7',
        end: '#F72585'
    }
];
