"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createTerrain, getTerrainHeight } from "./terrain";
import { createScenery } from "./scenery";
import { createCar } from "./car";
import {
    createRoad,
    createBranchRoad,
    getStartPosition,
} from "./road";
import type { ScenicMetrics } from "./scenic-hud";

interface ScenicCanvasProps {
    gameState: "start" | "playing" | "paused";
    onMetricsUpdate?: (metrics: ScenicMetrics) => void;
    resetTrigger?: number;
    onPauseToggle?: () => void;
    onResetCar?: () => void;
}

export default function ScenicCanvas({
    gameState,
    onMetricsUpdate,
    resetTrigger = 0,
    onPauseToggle,
    onResetCar,
}: ScenicCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameStateRef = useRef(gameState);
    const resetTriggerRef = useRef(resetTrigger);
    const onMetricsUpdateRef = useRef(onMetricsUpdate);
    const onPauseToggleRef = useRef(onPauseToggle);
    const onResetCarRef = useRef(onResetCar);

    useEffect(() => {
        gameStateRef.current = gameState;
        resetTriggerRef.current = resetTrigger;
        onMetricsUpdateRef.current = onMetricsUpdate;
        onPauseToggleRef.current = onPauseToggle;
        onResetCarRef.current = onResetCar;
    }, [gameState, resetTrigger, onMetricsUpdate, onPauseToggle, onResetCar]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb);

        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );

        let cameraYaw = 0;
        let cameraPitch = 0.35;
        const mouseSensitivity = 0.002;
        let mouseIdleTime = 0;
        const autoCenterDelay = 1;
        const autoCenterSpeed = 3;

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
        });

        const handleClick = () => {
            if (gameStateRef.current === "playing") {
                renderer.domElement.requestPointerLock();
            }
        };

        renderer.domElement.addEventListener("click", handleClick);
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        container.appendChild(renderer.domElement);

        const car = createCar();
        scene.add(car);

        const start = getStartPosition();
        car.position.x = start.position.x;
        car.position.z = start.position.z;
        car.rotation.y = start.rotationY;

        const road = createRoad();
        scene.add(road);

        const branchRoad = createBranchRoad();
        scene.add(branchRoad);

        const roadRaycaster = new THREE.Raycaster();
        const roadRayOrigin = new THREE.Vector3();
        const roadRayDirection = new THREE.Vector3(0, -1, 0);

        const terrain = createTerrain();
        scene.add(terrain);

        const scenery = createScenery();
        scene.add(scenery);

        const ambientLight = new THREE.AmbientLight(0xffffff, 2);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
        sunLight.position.set(50, 100, 50);
        scene.add(sunLight);

        camera.position.set(0, 3, 8);
        camera.lookAt(car.position);

        const forward = new THREE.Vector3();
        let speed = 0;
        let accelerating = false;
        let reversing = false;
        let steering = 0;

        const maxSpeed = 0.2;
        const acceleration = 0.005;
        const deceleration = 0.003;

        let totalDistance = 0;
        const lastCarPos = car.position.clone();
        let frameCount = 0;
        let currentResetVal = resetTriggerRef.current;

        const resetCarPosition = () => {
            const startPos = getStartPosition();
            car.position.set(startPos.position.x, 0.5, startPos.position.z);
            car.rotation.set(0, startPos.rotationY, 0);
            speed = 0;
            accelerating = false;
            reversing = false;
            steering = 0;
            cameraYaw = startPos.rotationY;
            cameraPitch = 0.35;
            lastCarPos.copy(car.position);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();

            if (key === "escape" || key === "p") {
                if (onPauseToggleRef.current) {
                    onPauseToggleRef.current();
                }
                return;
            }

            if (key === "r") {
                if (onResetCarRef.current) {
                    onResetCarRef.current();
                }
                resetCarPosition();
                return;
            }

            if (gameStateRef.current !== "playing") return;

            if (key === "w" || event.key === "ArrowUp") {
                accelerating = true;
            }
            if (key === "a" || event.key === "ArrowLeft") {
                steering = -1;
            }
            if (key === "d" || event.key === "ArrowRight") {
                steering = 1;
            }
            if (key === "s" || event.key === "ArrowDown") {
                reversing = true;
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();

            if (key === "w" || event.key === "ArrowUp") {
                accelerating = false;
            }
            if (key === "a" || event.key === "ArrowLeft") {
                if (steering < 0) steering = 0;
            }
            if (key === "d" || event.key === "ArrowRight") {
                if (steering > 0) steering = 0;
            }
            if (key === "s" || event.key === "ArrowDown") {
                reversing = false;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        const handleMouseMove = (event: MouseEvent) => {
            if (document.pointerLockElement !== renderer.domElement) {
                return;
            }

            cameraYaw -= event.movementX * mouseSensitivity;
            cameraPitch -= event.movementY * mouseSensitivity;
            cameraPitch = Math.max(-0.2, Math.min(0.8, cameraPitch));
            mouseIdleTime = 0;
        };

        document.addEventListener("mousemove", handleMouseMove);

        const handleResize = () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };

        window.addEventListener("resize", handleResize);

        let animationFrameId: number;
        const cameraDistance = 8;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            // Check if reset was triggered from outside prop
            if (resetTriggerRef.current !== currentResetVal) {
                currentResetVal = resetTriggerRef.current;
                resetCarPosition();
            }

            const isPlaying = gameStateRef.current === "playing";

            if (isPlaying) {
                mouseIdleTime += 1 / 60;

                if (accelerating) {
                    speed += acceleration;
                } else if (reversing) {
                    speed -= acceleration;
                } else {
                    if (speed > 0) {
                        speed -= deceleration;
                    } else if (speed < 0) {
                        speed += deceleration;
                    }
                }

                speed = Math.max(-maxSpeed * 0.5, Math.min(speed, maxSpeed));

                const steeringStrength = 0.025;
                if (speed !== 0) {
                    car.rotation.y -=
                        steering * steeringStrength * (speed / maxSpeed);

                    car.getWorldDirection(forward);
                    car.position.addScaledVector(forward, -speed);
                }
            } else {
                // If paused or in start screen, decelerate to 0
                if (speed > 0) speed = Math.max(0, speed - deceleration * 2);
                if (speed < 0) speed = Math.min(0, speed + deceleration * 2);
            }

            // Height and Road Raycasting
            roadRayOrigin.set(car.position.x, car.position.y + 20, car.position.z);
            roadRaycaster.set(roadRayOrigin, roadRayDirection);
            const roadHits = roadRaycaster.intersectObjects([road, branchRoad], false);
            const isOnRoad = roadHits.length > 0;

            if (isOnRoad) {
                const targetHeight = roadHits[0].point.y + 0.35;
                car.position.y = THREE.MathUtils.lerp(car.position.y, targetHeight, 0.25);
            } else {
                const terrainHeight = getTerrainHeight(car.position.x, car.position.z) + 0.1;
                car.position.y = THREE.MathUtils.lerp(car.position.y, terrainHeight, 0.2);
            }

            // Distance calculation
            if (isPlaying) {
                const moved = car.position.distanceTo(lastCarPos);
                if (moved > 0.001) {
                    totalDistance += moved * 3; // scaled into virtual meters
                    lastCarPos.copy(car.position);
                }
            }

            // Camera follow / orbit
            if (mouseIdleTime > autoCenterDelay) {
                const targetCameraYaw = car.rotation.y;
                cameraYaw = THREE.MathUtils.lerp(
                    cameraYaw,
                    targetCameraYaw,
                    autoCenterSpeed / 60
                );
            }

            const horizontalDistance = cameraDistance * Math.cos(cameraPitch);
            camera.position.set(
                car.position.x + Math.sin(cameraYaw) * horizontalDistance,
                car.position.y + 2 + Math.sin(cameraPitch) * cameraDistance,
                car.position.z + Math.cos(cameraYaw) * horizontalDistance
            );

            camera.lookAt(car.position.x, car.position.y + 0.5, car.position.z);

            renderer.render(scene, camera);

            // Metrics reporting (throttled every 6 frames)
            frameCount++;
            if (frameCount % 6 === 0 && onMetricsUpdateRef.current) {
                const speedKmh = Math.round(Math.abs(speed) * 350);
                let gear: "P" | "D" | "R" | "N" = "N";
                if (!isPlaying && speedKmh === 0) {
                    gear = "P";
                } else if (speed > 0.005) {
                    gear = "D";
                } else if (speed < -0.005) {
                    gear = "R";
                } else {
                    gear = "N";
                }

                const headingDeg = Math.round(
                    ((car.rotation.y * (180 / Math.PI)) % 360 + 360) % 360
                );

                onMetricsUpdateRef.current({
                    speedKmh,
                    distanceMeters: Math.round(totalDistance),
                    gear,
                    headingDeg,
                    isOnRoad,
                });
            }
        };

        animate();

        return () => {
            car.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach((material) => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });

            road.geometry.dispose();
            if (Array.isArray(road.material)) {
                road.material.forEach((material) => material.dispose());
            } else {
                road.material.dispose();
            }

            branchRoad.geometry.dispose();
            if (Array.isArray(branchRoad.material)) {
                branchRoad.material.forEach((material) => material.dispose());
            } else {
                branchRoad.material.dispose();
            }

            renderer.dispose();
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("resize", handleResize);
            renderer.domElement.removeEventListener("click", handleClick);
            document.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);

            if (renderer.domElement.parentElement === container) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-screen overflow-hidden cursor-grab active:cursor-grabbing"
        />
    );
}