'use client';

import React from 'react';
import { ShapeType } from '../utils/shapes';
import { Heart, Flower, Globe, User, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface ControlsProps {
    currentShape: ShapeType;
    onShapeChange: (shape: ShapeType) => void;
}

const shapes: { type: ShapeType; label: string; icon: React.ReactNode }[] = [
    { type: 'heart', label: 'Heart', icon: <Heart className="w-5 h-5" /> },
    { type: 'flower', label: 'Flower', icon: <Flower className="w-5 h-5" /> },
    { type: 'saturn', label: 'Saturn', icon: <Globe className="w-5 h-5" /> },
    { type: 'fireworks', label: 'Fireworks', icon: <Sparkles className="w-5 h-5" /> },
];

export default function Controls({ currentShape, onShapeChange }: ControlsProps) {
    return (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-4 w-full max-w-2xl px-4">

            {/* Shape Selector */}
            <div className="bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 flex gap-2 overflow-x-auto max-w-full">
                {shapes.map((shape) => (
                    <button
                        key={shape.type}
                        onClick={() => onShapeChange(shape.type)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-medium whitespace-nowrap",
                            currentShape === shape.type
                                ? "bg-white text-black shadow-lg scale-105"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        {shape.icon}
                        <span>{shape.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
