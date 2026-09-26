import * as THREE from "three";

export function createCar() {
    const car = new THREE.Group();

    const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xc8522e,
    });

    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

    body.position.y = 0.5;

    car.add(body);

    const hoodGeometry = new THREE.BoxGeometry(1.9, 0.35, 1.2);

    const hoodMaterial = new THREE.MeshStandardMaterial({
        color: 0xc8522e,
    });

    const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);

    hood.position.set(0, 0.95, -1.3);

    car.add(hood);

    const rearGeometry = new THREE.BoxGeometry(1.9, 0.45, 0.9);

    const rearMaterial = new THREE.MeshStandardMaterial({
        color: 0xc8522e,
    });

    const rear = new THREE.Mesh(rearGeometry, rearMaterial);

    rear.position.set(0, 0.85, 1.45);

    car.add(rear);

    const cabinGeometry = new THREE.BoxGeometry(1.5, 0.8, 2);

    const cabinMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
    });

    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);

    cabin.position.y = 1.2;
    cabin.position.z = 0.2;

    cabin.rotation.x = -0.08;

    car.add(cabin);

    const windshieldGeometry = new THREE.BoxGeometry(1.35, 0.45, 0.05);

    const windshieldMaterial = new THREE.MeshStandardMaterial({
        color: 0x6f9aa8,
    });

    const windshield = new THREE.Mesh(
        windshieldGeometry,
        windshieldMaterial
    );

    windshield.position.set(0, 1.25, -0.82);
    windshield.rotation.x = -0.08;

    car.add(windshield);

    const sideWindowGeometry = new THREE.BoxGeometry(
        0.05,
        0.45,
        1.5
    );

    const sideWindowMaterial = new THREE.MeshStandardMaterial({
        color: 0x6f9aa8,
    });

    const leftSideWindow = new THREE.Mesh(
        sideWindowGeometry,
        sideWindowMaterial
    );

    leftSideWindow.position.set(
        -0.76,
        1.25,
        0.2
    );

    car.add(leftSideWindow);


    const rightSideWindow = new THREE.Mesh(
        sideWindowGeometry,
        sideWindowMaterial
    );

    rightSideWindow.position.set(
        0.76,
        1.25,
        0.2
    );

    car.add(rightSideWindow);

    const rearWindowGeometry = new THREE.BoxGeometry(
        1.35,
        0.45,
        0.05
    );
    
    const rearWindow = new THREE.Mesh(
        rearWindowGeometry,
        sideWindowMaterial
    );
    
    rearWindow.position.set(
        0,
        1.25,
        1.22
    );
    
    car.add(rearWindow);

    const headlightGeometry = new THREE.BoxGeometry(0.35, 0.2, 0.08);

    const headlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffcc,
        emissive: 0xffffaa,
        emissiveIntensity: 0.5,
    });

    const leftHeadlight = new THREE.Mesh(
        headlightGeometry,
        headlightMaterial
    );

    leftHeadlight.position.set(-0.65, 0.65, -2.02);

    car.add(leftHeadlight);


    const rightHeadlight = new THREE.Mesh(
        headlightGeometry,
        headlightMaterial
    );

    rightHeadlight.position.set(0.65, 0.65, -2.02);

    car.add(rightHeadlight);

    const taillightGeometry = new THREE.BoxGeometry(0.35, 0.2, 0.08);

    const taillightMaterial = new THREE.MeshStandardMaterial({
        color: 0xcc2222,
        emissive: 0x660000,
        emissiveIntensity: 0.4,
    });

    const leftTaillight = new THREE.Mesh(
        taillightGeometry,
        taillightMaterial
    );

    leftTaillight.position.set(-0.65, 0.65, 2.02);

    car.add(leftTaillight);


    const rightTaillight = new THREE.Mesh(
        taillightGeometry,
        taillightMaterial
    );

    rightTaillight.position.set(0.65, 0.65, 2.02);

    car.add(rightTaillight);

    const wheelGeometry = new THREE.CylinderGeometry(
        0.45,
        0.45,
        0.35,
        16
    );

    const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
    });

    const wheelPositions = [
        [-1.05, 0.35, 1.3],
        [1.05, 0.35, 1.3],
        [-1.05, 0.35, -1.3],
        [1.05, 0.35, -1.3],
    ];

    wheelPositions.forEach(([x, y, z]) => {
        const wheel = new THREE.Mesh(
            wheelGeometry,
            wheelMaterial
        );

        wheel.position.set(x, y, z);

        wheel.rotation.z = Math.PI / 2;

        car.add(wheel);
    });

    return car;
}