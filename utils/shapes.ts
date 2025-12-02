import * as THREE from 'three';

export type ShapeType = 'heart' | 'flower' | 'saturn' | 'buddha' | 'fireworks' | 'hello' | 'peace' | 'threesome' | 'four' | '555';

export const generateShapePoints = (type: ShapeType, count: number): Float32Array => {
    const positions = new Float32Array(count * 3);
    const vector = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
        switch (type) {
            case 'heart':
                getHeartPoint(vector);
                break;
            case 'flower':
                getFlowerPoint(vector);
                break;
            case 'saturn':
                getSaturnPoint(vector, i, count);
                break;
            case 'buddha':
                getBuddhaPoint(vector);
                break;
            case 'fireworks':
                getFireworksPoint(vector);
                break;
            case 'hello':
                getTextPoint(vector, 'HELLO');
                break;
            case 'peace':
                getTextPoint(vector, 'PEACE?');
                break;
            case 'threesome':
                getTextPoint(vector, 'THREESOME?');
                break;
            case 'four':
                getTextPoint(vector, 'FOUR!');
                break;
            case '555':
                getTextPoint(vector, '555');
                break;
        }
        positions[i * 3] = vector.x;
        positions[i * 3 + 1] = vector.y;
        positions[i * 3 + 2] = vector.z;
    }

    return positions;
};

const getHeartPoint = (target: THREE.Vector3) => {
    const t = Math.random() * Math.PI * 2;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

    target.x = hx * 0.1;
    target.y = hy * 0.1;
    target.z = (Math.random() - 0.5) * 2;

    target.x += (Math.random() - 0.5) * 0.2;
    target.y += (Math.random() - 0.5) * 0.2;
    target.z += (Math.random() - 0.5) * 0.2;
};

const getFlowerPoint = (target: THREE.Vector3) => {
    const k = 4;
    const theta = Math.random() * Math.PI * 2;
    const r = Math.cos(k * theta);
    const phi = (Math.random() - 0.5) * Math.PI;

    target.x = r * Math.cos(theta) * 2;
    target.y = r * Math.sin(theta) * 2;
    target.z = Math.sin(phi) * 0.5 + (Math.random() - 0.5);
};

const getSaturnPoint = (target: THREE.Vector3, i: number, total: number) => {
    const ratio = 0.7;
    if (Math.random() < ratio) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 1.5;
        target.x = r * Math.sin(phi) * Math.cos(theta);
        target.y = r * Math.sin(phi) * Math.sin(theta);
        target.z = r * Math.cos(phi);
    } else {
        const theta = Math.random() * Math.PI * 2;
        const r = 2.2 + Math.random() * 1.0;
        target.x = r * Math.cos(theta);
        target.y = (Math.random() - 0.5) * 0.1;
        target.z = r * Math.sin(theta);

        const tilt = Math.PI / 6;
        const y = target.y;
        const z = target.z;
        target.y = y * Math.cos(tilt) - z * Math.sin(tilt);
        target.z = y * Math.sin(tilt) + z * Math.cos(tilt);
    }
};

const getBuddhaPoint = (target: THREE.Vector3) => {
    const r = Math.random();

    if (r < 0.2) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const rad = 0.6;
        target.x = rad * Math.sin(phi) * Math.cos(theta);
        target.y = rad * Math.sin(phi) * Math.sin(theta) + 1.8;
        target.z = rad * Math.cos(phi);
    } else if (r < 0.6) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radX = 0.9;
        const radY = 1.1;
        const radZ = 0.8;
        target.x = radX * Math.sin(phi) * Math.cos(theta);
        target.y = radY * Math.sin(phi) * Math.sin(theta) + 0.5;
        target.z = radZ * Math.cos(phi);
    } else {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radX = 1.6;
        const radY = 0.6;
        const radZ = 1.2;
        target.x = radX * Math.sin(phi) * Math.cos(theta);
        target.y = radY * Math.sin(phi) * Math.sin(theta) - 0.8;
        target.z = radZ * Math.cos(phi);
    }
};

const getFireworksPoint = (target: THREE.Vector3) => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.random() * 4;
    target.x = r * Math.sin(phi) * Math.cos(theta);
    target.y = r * Math.sin(phi) * Math.sin(theta);
    target.z = r * Math.cos(phi);
};

// Letter shape definitions (5x5 bitmap)
const LETTERS: { [key: string]: number[][] } = {
    'H': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
    'E': [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
    'L': [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
    'O': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
    'P': [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]],
    'A': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
    'C': [[0, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [0, 1, 1, 1, 1]],
    'T': [[1, 1, 1, 1, 1], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0]],
    'R': [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 1, 0, 0], [1, 0, 0, 1, 0]],
    'S': [[0, 1, 1, 1, 1], [1, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 1], [1, 1, 1, 1, 0]],
    'M': [[1, 0, 0, 0, 1], [1, 1, 0, 1, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
    'F': [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]],
    'U': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
    '?': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [0, 0, 0, 1, 0], [0, 0, 0, 0, 0], [0, 0, 1, 0, 0]],
    '!': [[0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 1, 0, 0]],
    '5': [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [0, 0, 0, 0, 1], [1, 1, 1, 1, 0]],
    ' ': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
};

// Generate particles for text
const getTextPoint = (target: THREE.Vector3, text: string) => {
    const pixelSize = 0.25;
    const charSpacing = 0.4;

    const pixels: { x: number; y: number }[] = [];
    let currentX = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i].toUpperCase();
        const letterData = LETTERS[char] || LETTERS[' '];

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (letterData[row][col] === 1) {
                    pixels.push({
                        x: currentX + col * pixelSize,
                        y: (4 - row) * pixelSize
                    });
                }
            }
        }
        currentX += 5 * pixelSize + charSpacing;
    }

    if (pixels.length === 0) {
        target.set(0, 0, 0);
        return;
    }

    const pixel = pixels[Math.floor(Math.random() * pixels.length)];

    const totalWidth = currentX - charSpacing;
    target.x = pixel.x - totalWidth / 2;
    target.y = pixel.y - (4 * pixelSize) / 2;
    target.z = (Math.random() - 0.5) * 0.2;
};
