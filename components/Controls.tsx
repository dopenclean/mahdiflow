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
    const [showGuide, setShowGuide] = React.useState(false);

    return (
        <>
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

                {/* Guide Button */}
                <button
                    onClick={() => setShowGuide(true)}
                    className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-6 py-2 rounded-full text-sm font-medium transition-all border border-white/10"
                >
                    Guide
                </button>
            </div>

            {/* Guide Modal */}
            {showGuide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-black/80 border border-white/10 rounded-3xl p-8 max-w-md w-full text-white relative shadow-2xl">
                        <button
                            onClick={() => setShowGuide(false)}
                            className="absolute top-4 right-4 text-white/50 hover:text-white"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-center">Gesture Guide</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-blue-400 mb-2">Heart • Flower • Saturn</h3>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li className="flex items-start gap-2">
                                        <span className="bg-white/10 p-1 rounded">✊</span>
                                        <span><strong>Fist:</strong> Implode particles</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="bg-white/10 p-1 rounded">👐</span>
                                        <span><strong>Two Hands Spread:</strong> Zoom in/out</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="bg-white/10 p-1 rounded">👌</span>
                                        <span><strong>Pinch:</strong> Spin Left/Right</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <h3 className="text-lg font-semibold text-purple-400 mb-2">Fireworks</h3>
                                <p className="text-xs text-gray-400 mb-2">Show fingers to reveal text:</p>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-full text-xs">1</span>
                                        <span>YNEAS</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-full text-xs">2</span>
                                        <span>MEOW MEOW</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-full text-xs">3</span>
                                        <span>SUZU</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-full text-xs">4</span>
                                        <span>RZ</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-full text-xs">5</span>
                                        <span>INDRA</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
