import * as THREE from "three";
import { getTerrainHeight } from "./terrain";

const ROAD_WIDTH = 7;
const ROAD_RADIUS_X = 360;
const ROAD_RADIUS_Z = 420;
const ROAD_SEGMENTS = 240;

const START_ANGLE = Math.PI;

export function getStartPosition() {
    const position = getRoadCenter(START_ANGLE);

    const nextPosition =
        getRoadCenter(START_ANGLE + 0.01);

    const direction = new THREE.Vector2(
        nextPosition.x - position.x,
        nextPosition.z - position.z
    ).normalize();

    const rotationY =
        Math.atan2(
            direction.x,
            direction.y
        );

    return {
        position,
        rotationY,
    };
}

export function getRoadCenter(
    angle: number
) {
    return new THREE.Vector3(
        Math.sin(angle) * ROAD_RADIUS_X,
        0,
        Math.cos(angle) * ROAD_RADIUS_Z
    );
}

export function getRoadHeight(
    angle: number
) {
    const center = getRoadCenter(angle);

    return (
        getTerrainHeight(
            center.x,
            center.z
        ) + 0.18
    );
}

export function createRoad() {
    const geometry = new THREE.BufferGeometry();

    const vertices: number[] = [];
    const indices: number[] = [];

    for (
        let i = 0;
        i <= ROAD_SEGMENTS;
        i++
    ) {
        const angle =
            (i / ROAD_SEGMENTS) *
            Math.PI *
            2;

        const center =
            getRoadCenter(angle);

        const nextAngle =
            angle + 0.01;

        const next =
            getRoadCenter(nextAngle);

        const direction =
            new THREE.Vector2(
                next.x - center.x,
                next.z - center.z
            ).normalize();

        const perpendicular =
            new THREE.Vector2(
                -direction.y,
                direction.x
            );

        const leftX =
            center.x +
            perpendicular.x *
                (ROAD_WIDTH / 2);

        const leftZ =
            center.z +
            perpendicular.y *
                (ROAD_WIDTH / 2);

        const rightX =
            center.x -
            perpendicular.x *
                (ROAD_WIDTH / 2);

        const rightZ =
            center.z -
            perpendicular.y *
                (ROAD_WIDTH / 2);

        const leftY =
            getTerrainHeight(
                leftX,
                leftZ
            ) + 0.18;

        const rightY =
            getTerrainHeight(
                rightX,
                rightZ
            ) + 0.18;

        vertices.push(
            leftX,
            leftY,
            leftZ,

            rightX,
            rightY,
            rightZ
        );
    }

    for (
        let i = 0;
        i < ROAD_SEGMENTS;
        i++
    ) {
        const current = i * 2;
        const next = current + 2;

        indices.push(
            current,
            next,
            current + 1,

            current + 1,
            next,
            next + 1
        );
    }

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            vertices,
            3
        )
    );

    geometry.setIndex(indices);

    geometry.computeVertexNormals();

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x3f3f3f,
            side: THREE.DoubleSide,
        });

    return new THREE.Mesh(
        geometry,
        material
    );
}

export function createBranchRoad() {
    const geometry = new THREE.BufferGeometry();

    const vertices: number[] = [];
    const indices: number[] = [];

    const ROAD_WIDTH = 6;
    const SEGMENTS = 60;

    // Branch starts from the west side of the main loop
    const startX = -ROAD_RADIUS_X;
    const startZ = 0;

    for (let i = 0; i <= SEGMENTS; i++) {
        const t = i / SEGMENTS;

        // Gradually move further west
        const centerX =
            startX - t * 220;

        const centerZ =
            startZ +
            Math.sin(t * Math.PI) * 35;

        const nextT =
            Math.min(t + 0.01, 1);

        const nextX =
            startX - nextT * 220;

        const nextZ =
            startZ +
            Math.sin(nextT * Math.PI) * 35;

        const direction =
            new THREE.Vector2(
                nextX - centerX,
                nextZ - centerZ
            ).normalize();

        const perpendicular =
            new THREE.Vector2(
                -direction.y,
                direction.x
            );

        const leftX =
            centerX +
            perpendicular.x *
                (ROAD_WIDTH / 2);

        const leftZ =
            centerZ +
            perpendicular.y *
                (ROAD_WIDTH / 2);

        const rightX =
            centerX -
            perpendicular.x *
                (ROAD_WIDTH / 2);

        const rightZ =
            centerZ -
            perpendicular.y *
                (ROAD_WIDTH / 2);

        const leftY =
            getTerrainHeight(
                leftX,
                leftZ
            ) + 0.18;

        const rightY =
            getTerrainHeight(
                rightX,
                rightZ
            ) + 0.18;

        vertices.push(
            leftX,
            leftY,
            leftZ,

            rightX,
            rightY,
            rightZ
        );
    }

    for (let i = 0; i < SEGMENTS; i++) {
        const current = i * 2;
        const next = current + 2;

        indices.push(
            current,
            next,
            current + 1,

            current + 1,
            next,
            next + 1
        );
    }

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            vertices,
            3
        )
    );

    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x3f3f3f,
            side: THREE.DoubleSide,
        });

    return new THREE.Mesh(
        geometry,
        material
    );
}