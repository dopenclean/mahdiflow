'use client';

import React from 'react';
import { ColorGradient } from '../utils/gradients';
import { clsx } from 'clsx';

interface GradientSelectorProps {
    gradients: ColorGradient[];
    currentGradient: ColorGradient;
    onGradientChange: (gradient: ColorGradient) => void;
}

export default function GradientSelector({ gradients, currentGradient, onGradientChange }: GradientSelectorProps) {
    return (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
            {gradients.map((gradient) => (
                <button
                    key={gradient.id}
                    onClick={() => onGradientChange(gradient)}
                    className={clsx(
                        "w-12 h-16 rounded-lg transition-all duration-300 relative group",
                        "backdrop-blur-md border-2",
                        currentGradient.id === gradient.id
                            ? "border-white scale-110 shadow-2xl"
                            : "border-white/20 hover:border-white/40 hover:scale-105"
                    )}
                    style={{
                        background: gradient.mid
                            ? `linear-gradient(180deg, ${gradient.start}, ${gradient.mid}, ${gradient.end})`
                            : `linear-gradient(180deg, ${gradient.start}, ${gradient.end})`
                    }}
                    title={gradient.name}
                >
                    {/* Glow effect on hover */}
                    <div
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-xl"
                        style={{
                            background: gradient.mid
                                ? `linear-gradient(180deg, ${gradient.start}, ${gradient.mid}, ${gradient.end})`
                                : `linear-gradient(180deg, ${gradient.start}, ${gradient.end})`
                        }}
                    />

                    {/* Label on hover */}
                    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg whitespace-nowrap">
                            <p className="text-white text-xs font-medium">{gradient.name}</p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
