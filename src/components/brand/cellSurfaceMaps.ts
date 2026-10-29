import { DataTexture, RepeatWrapping, RGBAFormat } from "three";

// Procedural surface detail for the blood cell. The model ships with UVs but no textures (its .mtl is
// plain white), so these are generated once on load: a tileable noise height field turned into a
// normal map (fine membrane bumps) and a roughness map (patchy gloss). 256px keeps it cheap.

const SIZE = 256;

/** Small seeded PRNG so the surface looks the same on every load. */
const mulberry32 = (seed: number) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Tileable multi-octave value noise in [0, 1], sampled on a SIZE x SIZE grid. */
const heightField = () => {
    const random = mulberry32(7);
    const octaves = [
        { cells: 6, weight: 0.5 },
        { cells: 14, weight: 0.3 },
        { cells: 32, weight: 0.2 }
    ].map(({ cells, weight }) => ({ cells, weight, grid: Array.from({ length: cells * cells }, random) }));

    const heights = new Float32Array(SIZE * SIZE);
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            let value = 0;
            for (const { cells, weight, grid } of octaves) {
                const gx = (x / SIZE) * cells;
                const gy = (y / SIZE) * cells;
                const x0 = Math.floor(gx);
                const y0 = Math.floor(gy);
                // Wrapping the lattice makes the texture tile without seams.
                const at = (cx: number, cy: number) => grid[(cy % cells) * cells + (cx % cells)];
                const tx = smooth(gx - x0);
                const ty = smooth(gy - y0);
                const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx;
                const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
                value += (top + (bottom - top) * ty) * weight;
            }
            heights[y * SIZE + x] = value;
        }
    }
    return heights;
};

const toTexture = (data: Uint8Array) => {
    const texture = new DataTexture(data, SIZE, SIZE, RGBAFormat);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.needsUpdate = true;
    return texture;
};

const createCellSurfaceMaps = () => {
    const heights = heightField();
    const h = (x: number, y: number) => heights[((y + SIZE) % SIZE) * SIZE + ((x + SIZE) % SIZE)];

    const normals = new Uint8Array(SIZE * SIZE * 4);
    const roughness = new Uint8Array(SIZE * SIZE * 4);
    const strength = 6;

    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const i = (y * SIZE + x) * 4;

            // Central differences of the height field give the surface slope at each texel.
            const dx = (h(x + 1, y) - h(x - 1, y)) * strength;
            const dy = (h(x, y + 1) - h(x, y - 1)) * strength;
            const length = Math.hypot(dx, dy, 1);
            normals[i] = ((-dx / length) * 0.5 + 0.5) * 255;
            normals[i + 1] = ((-dy / length) * 0.5 + 0.5) * 255;
            normals[i + 2] = ((1 / length) * 0.5 + 0.5) * 255;
            normals[i + 3] = 255;

            // three.js reads roughness from the green channel: 0.28 (glossy) to 0.55 (satin).
            const value = (0.28 + h(x, y) * 0.27) * 255;
            roughness[i] = value;
            roughness[i + 1] = value;
            roughness[i + 2] = value;
            roughness[i + 3] = 255;
        }
    }

    return { normalMap: toTexture(normals), roughnessMap: toTexture(roughness) };
};

export { createCellSurfaceMaps };
