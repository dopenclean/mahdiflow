'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { generateShapePoints, ShapeType } from '../utils/shapes';
import { ColorGradient } from '../utils/gradients';
import type { Results, NormalizedLandmarkList } from '@mediapipe/hands';

interface ParticleSceneProps {
    shape: ShapeType;
    gradient: ColorGradient;
}

// Create circular sprite texture for particles
function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    return new THREE.CanvasTexture(canvas);
}

// Count extended fingers with improved detection
function countExtendedFingers(landmarks: NormalizedLandmarkList): number {
    let count = 0;

    // Thumb: Compare tip (4) with IP joint (3) on X-axis
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const thumbMCP = landmarks[2];

    // Thumb is extended if tip is further from palm than IP joint
    const thumbExtended = Math.abs(thumbTip.x - thumbMCP.x) > Math.abs(thumbIP.x - thumbMCP.x);
    if (thumbExtended) count++;

    // Other fingers: Compare tip Y with MCP (base) Y
    // Finger tips: 8 (index), 12 (middle), 16 (ring), 20 (pinky)
    // Finger MCPs: 5 (index), 9 (middle), 13 (ring), 17 (pinky)
    const fingerPairs = [
        { tip: 8, mcp: 5 },   // Index
        { tip: 12, mcp: 9 },  // Middle
        { tip: 16, mcp: 13 }, // Ring
        { tip: 20, mcp: 17 }  // Pinky
    ];

    fingerPairs.forEach(pair => {
        const tip = landmarks[pair.tip];
        const mcp = landmarks[pair.mcp];
        // Finger is extended if tip Y is significantly smaller (higher on screen) than MCP
        if (tip.y < mcp.y - 0.08) {
            count++;
        }
    });

    return count;
}

export default function ParticleScene({ shape: initialShape, gradient }: ParticleSceneProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [loading, setLoading] = useState(true);

    const sceneRef = useRef<THREE.Scene>(null);
    const particlesRef = useRef<THREE.Points>(null);
    const targetPositionsRef = useRef<Float32Array>(null);
    const latestGradient = useRef(gradient);
    const baseShapeRef = useRef<ShapeType>(initialShape); // The selected shape (heart, fireworks, etc)
    const currentShapeRef = useRef<ShapeType>(initialShape); // Current active shape (can change with fingers)
    const rotationSpeedRef = useRef(0.002);
    const rotationDirectionRef = useRef(1); // 1 for right, -1 for left
    const flickerPhaseRef = useRef(0);

    useEffect(() => {
        latestGradient.current = gradient;
        if (particlesRef.current) {
            // Update gradient colors in the color attribute
            const colors = (particlesRef.current.geometry.attributes.color.array as Float32Array);
            const particleCount = colors.length / 3;

            for (let i = 0; i < particleCount; i++) {
                const t = i / particleCount;
                const startColor = new THREE.Color(gradient.start);
                const endColor = new THREE.Color(gradient.end);
                const color = startColor.clone().lerp(endColor, t);

                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;
            }
            particlesRef.current.geometry.attributes.color.needsUpdate = true;
        }
    }, [gradient]);

    useEffect(() => {
        baseShapeRef.current = initialShape;
        currentShapeRef.current = initialShape;
        if (targetPositionsRef.current) {
            const newTargets = generateShapePoints(initialShape, 8000);
            for (let i = 0; i < newTargets.length; i++) {
                targetPositionsRef.current[i] = newTargets[i];
            }
        }
    }, [initialShape]);

    useEffect(() => {
        if (!containerRef.current || !videoRef.current) return;

        let isMounted = true;
        let animationId: number;
        let resizeHandler: (() => void) | null = null;

        // Resources to cleanup
        let scene: THREE.Scene | null = null;
        let renderer: THREE.WebGLRenderer | null = null;
        let cameraUtils: any = null;
        let hands: any = null;

        const init = async () => {
            // Dynamic imports
            const { Hands } = await import('@mediapipe/hands');
            const { Camera } = await import('@mediapipe/camera_utils');

            if (!isMounted) return;

            // --- Three.js Setup ---
            scene = new THREE.Scene();
            sceneRef.current = scene;

            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 5;

            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);

            if (containerRef.current) {
                containerRef.current.appendChild(renderer.domElement);
            }

            // --- Particles ---
            const particleCount = 8000;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const sizes = new Float32Array(particleCount);
            const colors = new Float32Array(particleCount * 3);

            for (let i = 0; i < particleCount * 3; i++) {
                positions[i] = (Math.random() - 0.5) * 10;
            }

            // Randomize particle sizes for depth effect
            for (let i = 0; i < particleCount; i++) {
                sizes[i] = Math.random() * 0.05 + 0.03; // 0.03 to 0.08

                // Initialize colors with gradient
                const t = i / particleCount;
                const startColor = new THREE.Color(latestGradient.current.start);
                const endColor = new THREE.Color(latestGradient.current.end);
                const color = startColor.clone().lerp(endColor, t);

                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            // Create sprite texture for circular particles
            const particleTexture = createParticleTexture();

            const material = new THREE.PointsMaterial({
                size: 0.08,
                map: particleTexture,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                sizeAttenuation: true,
                vertexColors: true, // Use per-particle colors
            });

            const particles = new THREE.Points(geometry, material);
            particlesRef.current = particles;
            scene.add(particles);

            targetPositionsRef.current = generateShapePoints(currentShapeRef.current, particleCount);
            const currentPositions = positions.slice();

            let handTension = 0;
            let handDistance = 1;

            // --- MediaPipe Setup ---
            hands = new Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
            });

            hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            hands.onResults((results: Results) => {
                if (!isMounted) return;

                if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                    let totalTension = 0;
                    let p1: any = null;
                    let p2: any = null;
                    let leftHandPinching = false;
                    let rightHandPinching = false;
                    let detectedFingerCount = 0;

                    results.multiHandLandmarks.forEach((landmarks, index) => {
                        const handedness = results.multiHandedness?.[index]?.label || 'Unknown';

                        // Fist detection (for spin)
                        const wrist = landmarks[0];
                        const tips = [4, 8, 12, 16, 20];
                        let avgDist = 0;
                        tips.forEach(idx => {
                            const tip = landmarks[idx];
                            const d = Math.sqrt(
                                Math.pow(tip.x - wrist.x, 2) +
                                Math.pow(tip.y - wrist.y, 2) +
                                Math.pow(tip.z - wrist.z, 2)
                            );
                            avgDist += d;
                        });
                        avgDist /= 5;

                        const tension = Math.max(0, Math.min(1, (0.35 - avgDist) * 4));
                        totalTension += tension;

                        if (index === 0) p1 = wrist;
                        if (index === 1) p2 = wrist;

                        // Pinch detection (Thumb + Index for spin rotation)
                        const thumbTip = landmarks[4];
                        const indexTip = landmarks[8];
                        const pinchDist = Math.sqrt(
                            Math.pow(thumbTip.x - indexTip.x, 2) +
                            Math.pow(thumbTip.y - indexTip.y, 2) +
                            Math.pow(thumbTip.z - indexTip.z, 2)
                        );

                        // Increased threshold for better detection
                        if (pinchDist < 0.08) {
                            if (handedness === 'Left') {
                                leftHandPinching = true;
                            } else {
                                rightHandPinching = true;
                            }
                        }

                        // Finger counting (only for fireworks mode)
                        if (baseShapeRef.current === 'fireworks') {
                            detectedFingerCount = countExtendedFingers(landmarks);
                        }
                    });

                    // Update shape based on finger count (only in fireworks mode)
                    if (baseShapeRef.current === 'fireworks') {
                        let newShape: ShapeType = 'fireworks';

                        switch (detectedFingerCount) {
                            case 1:
                                newShape = 'hello';
                                break;
                            case 2:
                                newShape = 'peace';
                                break;
                            case 3:
                                newShape = 'threesome';
                                break;
                            case 4:
                                newShape = 'four';
                                break;
                            case 5:
                                newShape = '555';
                                break;
                            default:
                                newShape = 'fireworks'; // Return to fireworks burst
                        }

                        if (newShape !== currentShapeRef.current) {
                            currentShapeRef.current = newShape;
                            const newTargets = generateShapePoints(newShape, particleCount);
                            for (let i = 0; i < newTargets.length; i++) {
                                targetPositionsRef.current![i] = newTargets[i];
                            }
                        }
                    }
                    handTension = totalTension / results.multiHandLandmarks.length;

                    // Check if we're showing a text shape (need stability)
                    const isShowingText = currentShapeRef.current === 'hello' ||
                        currentShapeRef.current === 'peace' ||
                        currentShapeRef.current === 'threesome' ||
                        currentShapeRef.current === 'four' ||
                        currentShapeRef.current === '555';

                    // Pinch = Spin with direction
                    if (rightHandPinching || leftHandPinching) {
                        rotationSpeedRef.current = 0.05; // Fast spin when pinching

                        if (rightHandPinching && !leftHandPinching) {
                            rotationDirectionRef.current = 1; // Right (clockwise)
                        } else if (leftHandPinching && !rightHandPinching) {
                            rotationDirectionRef.current = -1; // Left (counter-clockwise)
                        }
                    }
                    // Fist = No spin when showing text, otherwise implode only
                    else if (handTension > 0.5 && !isShowingText) {
                        rotationSpeedRef.current = 0.002; // Keep slow rotation
                    }
                    // No gesture = slow rotation
                    else {
                        rotationSpeedRef.current = 0.002;
                    }

                    // Two hands = Scale (disabled when showing text for stability)
                    if (p1 && p2 && !isShowingText) {
                        const dist = Math.sqrt(
                            Math.pow(p1.x - p2.x, 2) +
                            Math.pow(p1.y - p2.y, 2)
                        );
                        handDistance = 0.5 + dist * 3;
                    } else if (isShowingText) {
                        // Keep text at stable size
                        handDistance = 1.0;
                    }
                } else {
                    handTension *= 0.95;
                    handDistance = handDistance * 0.95 + 1.0 * 0.05;
                    rotationSpeedRef.current = 0.002;

                    // Return to base fireworks shape when no hands detected
                    if (baseShapeRef.current === 'fireworks' && currentShapeRef.current !== 'fireworks') {
                        currentShapeRef.current = 'fireworks';
                        const newTargets = generateShapePoints('fireworks', particleCount);
                        for (let i = 0; i < newTargets.length; i++) {
                            targetPositionsRef.current![i] = newTargets[i];
                        }
                    }
                }
            });

            cameraUtils = new Camera(videoRef.current!, {
                onFrame: async () => {
                    if (videoRef.current && hands) {
                        await hands.send({ image: videoRef.current });
                    }
                },
                width: 640,
                height: 480
            });

            if (!isMounted) {
                hands.close();
                renderer.dispose();
                return;
            }

            await cameraUtils.start();

            if (!isMounted) return;
            setLoading(false);

            // --- Animation Loop ---
            const animate = () => {
                if (!isMounted) return;

                animationId = requestAnimationFrame(animate);

                const positions = particles.geometry.attributes.position.array as Float32Array;
                const targets = targetPositionsRef.current;
                const particleColors = particles.geometry.attributes.color.array as Float32Array;

                if (!targets) return;

                // Check if showing text shapes
                const isShowingText = currentShapeRef.current === 'hello' ||
                    currentShapeRef.current === 'peace' ||
                    currentShapeRef.current === 'threesome' ||
                    currentShapeRef.current === 'four' ||
                    currentShapeRef.current === '555';

                // Particles stay centered (no hand following)
                // Disable implode effect when showing text for stability
                const shrinkFactor = isShowingText ? 1.0 : (1.0 - (handTension * 0.8));
                const finalScale = handDistance * shrinkFactor;

                // Flicker effect for fireworks and text shapes
                let flickerMultiplier = 1.0;
                if (currentShapeRef.current === 'fireworks' || isShowingText) {
                    flickerPhaseRef.current += 0.05;
                    flickerMultiplier = 0.7 + Math.sin(flickerPhaseRef.current) * 0.3;
                }

                for (let i = 0; i < particleCount; i++) {
                    const ix = i * 3;
                    const iy = i * 3 + 1;
                    const iz = i * 3 + 2;

                    let tx = targets[ix];
                    let ty = targets[iy];
                    let tz = targets[iz];

                    // Apply scaling
                    tx *= finalScale;
                    ty *= finalScale;
                    tz *= finalScale;

                    // Add jitter if tension is high
                    if (handTension > 0.5) {
                        const jitter = (handTension - 0.5) * 0.1;
                        tx += (Math.random() - 0.5) * jitter;
                        ty += (Math.random() - 0.5) * jitter;
                        tz += (Math.random() - 0.5) * jitter;
                    }

                    currentPositions[ix] += (tx - currentPositions[ix]) * 0.08;
                    currentPositions[iy] += (ty - currentPositions[iy]) * 0.08;
                    currentPositions[iz] += (tz - currentPositions[iz]) * 0.08;

                    positions[ix] = currentPositions[ix];
                    positions[iy] = currentPositions[iy];
                    positions[iz] = currentPositions[iz];

                    // Update colors with flicker
                    const t = i / particleCount;
                    const startColor = new THREE.Color(latestGradient.current.start);
                    const endColor = new THREE.Color(latestGradient.current.end);
                    const color = startColor.clone().lerp(endColor, t);

                    particleColors[ix] = color.r * flickerMultiplier;
                    particleColors[iy] = color.g * flickerMultiplier;
                    particleColors[iz] = color.b * flickerMultiplier;
                }

                particles.geometry.attributes.position.needsUpdate = true;
                particles.geometry.attributes.color.needsUpdate = true;

                // Rotation with direction
                particles.rotation.y += rotationSpeedRef.current * rotationDirectionRef.current;

                if (renderer && scene) {
                    renderer.render(scene, camera);
                }
            };

            animate();

            const handleResize = () => {
                if (!renderer) return;
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener('resize', handleResize);
            resizeHandler = handleResize;
        };

        init();

        return () => {
            isMounted = false;
            if (resizeHandler) {
                window.removeEventListener('resize', resizeHandler);
            }
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            if (renderer) {
                if (containerRef.current && renderer.domElement) {
                    containerRef.current.removeChild(renderer.domElement);
                }
                renderer.dispose();
            }
            if (cameraUtils) {
                cameraUtils.stop();
            }
            if (hands) {
                hands.close();
            }
        };
    }, []); // Run once

    return (
        <div className="relative w-full h-full">
            <div ref={containerRef} className="absolute inset-0 z-0" />
            <video ref={videoRef} className="hidden" playsInline />
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-white z-50 bg-black/50">
                    <p>Initializing Camera & Hand Tracking...</p>
                </div>
            )}
        </div>
    );
}
