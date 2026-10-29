import { Environment, Float, Lightformer, OrbitControls } from "@react-three/drei";
import { Canvas, createPortal, useLoader, useThree } from "@react-three/fiber";
import { type ReactNode, Suspense, useEffect, useMemo } from "react";
import { Box3, Color, Mesh, MeshPhysicalMaterial, Sphere, Vector2, Vector3 } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

import { createCellSurfaceMaps } from "@/components/brand/cellSurfaceMaps";

const MODEL_URL = `${import.meta.env.BASE_URL}models/RedBloodCell_model.obj`;
/** Radius the model is scaled to, in scene units, whatever size it was exported at. */
const TARGET_RADIUS = 1.6;

const BloodCell = () => {
    const source = useLoader(OBJLoader, MODEL_URL);

    // The .mtl only says "plain white", so the look is built here: a deep red clear-coated membrane
    // with procedural bumps and patchy gloss so the studio reflections break up like a real surface.
    const material = useMemo(() => {
        const { normalMap, roughnessMap } = createCellSurfaceMaps();

        return new MeshPhysicalMaterial({
            color: new Color("#c0262b"),
            roughness: 1, // scaled per texel by roughnessMap
            roughnessMap,
            normalMap,
            normalScale: new Vector2(0.35, 0.35),
            clearcoat: 0.8,
            clearcoatRoughness: 0.22,
            sheen: 0.7,
            sheenRoughness: 0.45,
            sheenColor: new Color("#ff9a8a"),
            envMapIntensity: 1.1
        });
    }, []);

    useEffect(
        () => () => {
            material.normalMap?.dispose();
            material.roughnessMap?.dispose();
            material.dispose();
        },
        [material]
    );

    // Clone so StrictMode's double render and HMR never mutate the cached original, then recentre
    // and rescale: the Cinema 4D export is off-origin and roughly 50 units across.
    const model = useMemo(() => {
        const group = source.clone(true);

        group.traverse((child) => {
            if (child instanceof Mesh) child.material = material;
        });

        const sphere = new Box3().setFromObject(group).getBoundingSphere(new Sphere());
        const scale = TARGET_RADIUS / sphere.radius;
        group.scale.setScalar(scale);
        group.position.copy(sphere.center.clone().multiplyScalar(-scale));

        return group;
    }, [source, material]);

    return <primitive object={model} />;
};

/**
 * Children render in camera space. Auto-rotate and dragging orbit the camera, not the cell, so lights
 * parented here always light the side being looked at and no face ever turns dark.
 */
const CameraAttached = ({ children }: { children: ReactNode }) => {
    const camera = useThree((state) => state.camera);
    const scene = useThree((state) => state.scene);

    // The default camera is not part of the scene graph; lights only render if their parent is.
    useEffect(() => {
        scene.add(camera);
        return () => {
            scene.remove(camera);
        };
    }, [camera, scene]);

    return createPortal(children, camera);
};

/**
 * A soft studio built from light panels, rendered once into an environment map (frames={1}), so the
 * reflections cost nothing per frame and nothing is downloaded.
 */
const Studio = () => (
    <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#fff4ea" position={[0, 4, 3]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffd9cf" position={[-5, 0, 2]} scale={[2, 5, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#fff" position={[5, -1, -2]} scale={[2, 4, 1]} />
        <Lightformer form="ring" intensity={1.6} color="#ffffff" position={[2, 2, 5]} scale={1.2} />
        <Lightformer form="rect" intensity={1.4} color="#fff4ea" position={[0, 2, -5]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1} color="#ffe6df" position={[0, -5, 0]} rotation-x={-Math.PI / 2} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={1} color="#ffd9cf" position={[5, 0, 2]} scale={[2, 5, 1]} />
    </Environment>
);

interface BloodCellCanvasProps {
    /** Freeze the idle spin and bobbing for visitors who asked the OS for reduced motion. */
    reducedMotion: boolean;
}

// The spinning, draggable red blood cell beside the page title.
const BloodCellCanvas = ({ reducedMotion }: BloodCellCanvasProps) => (
    <Canvas
        dpr={[1, 2]}
        camera={{ position: new Vector3(0, 0, 5), fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        frameloop={reducedMotion ? "demand" : "always"}>
        <ambientLight intensity={0.55} />
        <CameraAttached>
            {/* Key, fill and rim, positioned relative to the viewer and aimed at the cell at the origin. */}
            <directionalLight position={[3, 3, 2]} intensity={1.5} />
            <directionalLight position={[-3, -1, 2]} intensity={0.8} color="#ffd9cf" />
            <directionalLight position={[0, 2, -4]} intensity={0.6} color="#fff4ea" />
        </CameraAttached>

        <Suspense fallback={null}>
            <Studio />
            <Float speed={reducedMotion ? 0 : 1.4} rotationIntensity={0.4} floatIntensity={0.6}>
                <BloodCell />
            </Float>
        </Suspense>

        <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate={!reducedMotion}
            autoRotateSpeed={2.5}
            enableDamping
        />
    </Canvas>
);

export default BloodCellCanvas;
