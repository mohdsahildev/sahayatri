import * as THREE from "three";

export const WORLD_SIZE = 1200;

const TERRAIN_SEGMENTS = 160;

export function getTerrainHeight(x: number, z: number) {
    // Large rolling hills
    const largeHills =
        Math.sin(x * 0.006) * 7 +
        Math.cos(z * 0.005) * 6;

    // Smaller variation
    const mediumHills =
        Math.sin(x * 0.018 + z * 0.01) * 2 +
        Math.cos(z * 0.02 - x * 0.008) * 1.5;

    // Very subtle surface variation
    const smallVariation =
        Math.sin(x * 0.045 + z * 0.03) * 0.5;

    return (
        largeHills +
        mediumHills +
        smallVariation
    );
}

export function createTerrain() {
    const geometry = new THREE.PlaneGeometry(
        WORLD_SIZE,
        WORLD_SIZE,
        TERRAIN_SEGMENTS,
        TERRAIN_SEGMENTS
    );

    geometry.rotateX(-Math.PI / 2);

    const positions =
        geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);

        positions.setY(
            i,
            getTerrainHeight(x, z)
        );
    }

    positions.needsUpdate = true;

    geometry.computeVertexNormals();

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x6b8e5a,
            flatShading: true,
        });

    return new THREE.Mesh(
        geometry,
        material
    );
}