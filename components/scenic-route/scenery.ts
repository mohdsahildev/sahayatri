import * as THREE from "three";
import { WORLD_SIZE, getTerrainHeight } from "./terrain";
import { getRoadCenter } from "./road";

export function createTree(
    x: number,
    z: number
) {
    const tree = new THREE.Group();

    const trunkGeometry =
        new THREE.CylinderGeometry(
            0.25,
            0.35,
            2,
            6
        );

    const trunkMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x6b4630,
        });

    const trunk = new THREE.Mesh(
        trunkGeometry,
        trunkMaterial
    );

    trunk.position.y = 1;

    tree.add(trunk);

    const leavesGeometry =
        new THREE.ConeGeometry(
            1.5,
            3.5,
            7
        );

    const leavesMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x3f6b3f,
            flatShading: true,
        });

    const leaves = new THREE.Mesh(
        leavesGeometry,
        leavesMaterial
    );

    leaves.position.y = 3.5;

    tree.add(leaves);

    tree.position.set(
        x,
        getTerrainHeight(x, z),
        z
    );

    return tree;
}

export function createRock(
    x: number,
    z: number
) {
    const rock = new THREE.Group();

    const geometry =
        new THREE.DodecahedronGeometry(
            1.2,
            0
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x77736b,
            flatShading: true,
        });

    const mesh = new THREE.Mesh(
        geometry,
        material
    );

    mesh.scale.set(
        1.2,
        0.8,
        1
    );

    rock.add(mesh);

    rock.position.set(
        x,
        getTerrainHeight(x, z) + 0.5,
        z
    );

    return rock;
}

function getDistanceToRoad(x: number, z: number) {
    let closestDistance = Infinity;

    const samples = 240;

    for (let i = 0; i < samples; i++) {
        const angle =
            (i / samples) * Math.PI * 2;

        const roadPoint =
            getRoadCenter(angle);

        const distance = Math.hypot(
            x - roadPoint.x,
            z - roadPoint.z
        );

        if (distance < closestDistance) {
            closestDistance = distance;
        }
    }

    return closestDistance;
}

export function createScenery() {
    const scenery = new THREE.Group();

    const spacing = 45;

    for (
        let x = -WORLD_SIZE / 2;
        x <= WORLD_SIZE / 2;
        x += spacing
    ) {
        for (
            let z = -WORLD_SIZE / 2;
            z <= WORLD_SIZE / 2;
            z += spacing
        ) {
            const distanceFromCenter =
                Math.sqrt(x * x + z * z);
                
            const offsetX =
                Math.sin(x * 0.13 + z) * 12;

            const offsetZ =
                Math.cos(z * 0.11 + x) * 12;

            const treeX = x + offsetX;
            const treeZ = z + offsetZ;
                    
            const distanceToRoad =
                getDistanceToRoad(treeX, treeZ);
                    
            if (distanceToRoad < 14) {
                continue;
            }
            
            const tree = createTree(
                treeX,
                treeZ
            );
            
            scenery.add(tree);

            const rockX =
                x +
                Math.sin(z * 0.07) * 18;

            const rockZ =
                z +
                Math.cos(x * 0.06) * 18;

            const rockDistanceToRoad =
                getDistanceToRoad(
                    rockX,
                    rockZ
                );
            
            if (rockDistanceToRoad >= 14) {
                const rock = createRock(
                    rockX,
                    rockZ
                );
            
                scenery.add(rock);
            }
        }
    }

    return scenery;
}