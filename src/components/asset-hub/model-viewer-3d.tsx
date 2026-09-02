"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Grid,
  Bounds,
  useBounds,
  ContactShadows,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Box, RotateCcw, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModelViewer3DProps {
  url: string;
  extension: string;
}

function Model({
  url,
  extension,
  wireframe,
  onStats,
}: {
  url: string;
  extension: string;
  wireframe: boolean;
  onStats: (s: { triangles: number; vertices: number } | null) => void;
}) {
  const object = useMemo<THREE.Object3D>(() => {
    const ext = extension.toLowerCase();
    if (ext === "obj") {
      const loader = new OBJLoader();
      return loader.parse(urlToText(url));
    }
    if (ext === "stl") {
      const loader = new STLLoader();
      const geometry = loader.parse(urlToArrayBuffer(url));
      geometry.computeVertexNormals();
      const material = new THREE.MeshStandardMaterial({
        color: "#c4b5fd",
        metalness: 0.2,
        roughness: 0.45,
        flatShading: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const group = new THREE.Group();
      group.add(mesh);
      return group;
    }
    if (ext === "gltf" || ext === "glb") {
      const loader = new GLTFLoader();
      const gltf = loader.parse(
        ext === "glb" ? urlToArrayBuffer(url) : urlToText(url),
        "",
      );
      return gltf.scene;
    }
    return new THREE.Object3D();
  }, [url, extension]);

  // Apply wireframe + compute stats
  useEffect(() => {
    let triangles = 0;
    let vertices = 0;
    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        const mat = mesh.material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => {
            if (m && "wireframe" in m) m.wireframe = wireframe;
          });
        } else if (mat && "wireframe" in mat) {
          mat.wireframe = wireframe;
        }
        const geo = mesh.geometry;
        if (geo) {
          if (geo.index) {
            triangles += geo.index.count / 3;
          } else if (geo.attributes.position) {
            triangles += geo.attributes.position.count / 3;
          }
          vertices += geo.attributes.position?.count ?? 0;
        }
      }
    });
    onStats({
      triangles: Math.round(triangles),
      vertices: Math.round(vertices),
    });
  }, [object, wireframe, onStats]);

  return (
    <Bounds fit clip observe margin={1.15}>
      <BoundsWrapper>
        <primitive object={object} />
      </BoundsWrapper>
    </Bounds>
  );
}

function BoundsWrapper({ children }: { children: React.ReactNode }) {
  const api = useBounds();
  useEffect(() => {
    const t = setTimeout(() => api.refresh().fit(), 60);
    return () => clearTimeout(t);
  }, [api]);
  return <>{children}</>;
}

function urlToText(url: string): string {
  // Synchronously fetch via XHR for parse() which needs text/buffer
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, false);
  xhr.send();
  return xhr.responseText;
}

function urlToArrayBuffer(url: string): ArrayBuffer {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, false);
  xhr.responseType = "arraybuffer";
  xhr.send();
  return xhr.response as ArrayBuffer;
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center gap-2 rounded-lg bg-card/90 px-3 py-2 text-sm shadow-lg">
        <Loader2 className="size-4 animate-spin text-primary" />
        Loading 3D model…
      </div>
    </Html>
  );
}

export function ModelViewer3D({ url, extension }: ModelViewer3DProps) {
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [stats, setStats] = useState<{
    triangles: number;
    vertices: number;
  } | null>(null);
  const controlsRef = useRef<any>(null);

  const handleStats = useMemo(
    () => (s: { triangles: number; vertices: number } | null) => setStats(s),
    [],
  );

  const resetView = () => {
    controlsRef.current?.reset();
  };

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="relative flex-1 bg-gradient-to-b from-muted/40 to-background">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [4, 3, 5], fov: 45, near: 0.1, far: 1000 }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
        >
          <color attach="background" args={["#0e0f14"]} />
          <ambientLight intensity={0.35} />
          <directionalLight
            position={[6, 8, 4]}
            intensity={1.4}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-6, 4, -4]} intensity={0.5} />

          <Suspense fallback={<LoadingFallback />}>
            <Model
              url={url}
              extension={extension}
              wireframe={wireframe}
              onStats={handleStats}
            />
            <Environment preset="city" />
          </Suspense>

          <ContactShadows
            position={[0, -1.3, 0]}
            opacity={0.45}
            scale={10}
            blur={2.4}
            far={4}
          />
          <Grid
            position={[0, -1.31, 0]}
            args={[20, 20]}
            cellSize={0.5}
            cellThickness={0.6}
            cellColor="#2a2d3a"
            sectionSize={2.5}
            sectionThickness={1}
            sectionColor="#3b3550"
            fadeDistance={22}
            fadeStrength={1}
            infiniteGrid
          />

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.08}
            autoRotate={autoRotate}
            autoRotateSpeed={1.1}
            minDistance={1}
            maxDistance={40}
          />
        </Canvas>
      </div>

      {/* Top-left overlay stats */}
      {stats && (
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1 rounded-lg border border-border/60 bg-card/85 px-3 py-2 text-[11px] shadow-lg backdrop-blur">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Box className="size-3 text-emerald-400" />
            <span>Triangles</span>
            <span className="ml-auto font-mono font-semibold text-foreground">
              {stats.triangles.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Box className="size-3 text-violet-400" />
            <span>Vertices</span>
            <span className="ml-auto font-mono font-semibold text-foreground">
              {stats.vertices.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/60 bg-card/90 p-1 shadow-lg backdrop-blur">
        <Button
          size="sm"
          variant={wireframe ? "secondary" : "ghost"}
          className="h-8 gap-1.5 rounded-full px-3 text-xs"
          onClick={() => setWireframe((w) => !w)}
        >
          {wireframe ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          Wireframe
        </Button>
        <Button
          size="sm"
          variant={autoRotate ? "secondary" : "ghost"}
          className="h-8 gap-1.5 rounded-full px-3 text-xs"
          onClick={() => setAutoRotate((r) => !r)}
        >
          <RotateCcw className="size-4" />
          Auto-rotate
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 rounded-full px-3 text-xs"
          onClick={resetView}
        >
          Reset
        </Button>
      </div>

      {/* Hint */}
      <div className="pointer-events-none absolute right-3 top-3 rounded-lg border border-border/60 bg-card/85 px-2.5 py-1.5 text-[11px] text-muted-foreground shadow-lg backdrop-blur">
        Drag to orbit · Scroll to zoom · Right-click to pan
      </div>
    </div>
  );
}
