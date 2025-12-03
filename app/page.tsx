'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Controls from '../components/Controls';
import GradientSelector from '../components/GradientSelector';
import { ShapeType } from '../utils/shapes';
import { gradientPalettes, ColorGradient } from '../utils/gradients';

const ParticleScene = dynamic(() => import('../components/ParticleScene'), { ssr: false });

export default function Home() {
  const [shape, setShape] = useState<ShapeType>('fireworks');
  const [gradient, setGradient] = useState<ColorGradient>(gradientPalettes[0]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-2xl font-bold text-white tracking-tighter">Mahdi<span className="text-white/50">FLOW</span></h1>
      </div>

      <ParticleScene shape={shape} gradient={gradient} />

      <Controls
        currentShape={shape}
        onShapeChange={setShape}
      />

      <GradientSelector
        gradients={gradientPalettes}
        currentGradient={gradient}
        onGradientChange={setGradient}
      />
    </main>
  );
}
