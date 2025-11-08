'use client';

import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface AnimatedImageProps {
  imageUrl: string;
  animationType: 'rotate' | 'wave' | 'zoom' | 'parallax';
}

function AnimatedImage({ imageUrl, animationType }: AnimatedImageProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(imageUrl);
  const [time, setTime] = useState(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    setTime(t => t + delta);

    switch (animationType) {
      case 'rotate':
        meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.5;
        meshRef.current.rotation.x = Math.cos(time * 0.3) * 0.2;
        meshRef.current.position.z = Math.sin(time * 0.4) * 0.3;
        break;

      case 'wave':
        const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
        const positionAttribute = geometry.attributes.position;

        for (let i = 0; i < positionAttribute.count; i++) {
          const x = positionAttribute.getX(i);
          const y = positionAttribute.getY(i);
          const wave = Math.sin(x * 2 + time * 2) * 0.1 + Math.cos(y * 2 + time * 1.5) * 0.1;
          positionAttribute.setZ(i, wave);
        }

        positionAttribute.needsUpdate = true;
        geometry.computeVertexNormals();
        break;

      case 'zoom':
        const scale = 1 + Math.sin(time * 1.5) * 0.3;
        meshRef.current.scale.set(scale, scale, 1);
        meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
        break;

      case 'parallax':
        meshRef.current.position.x = Math.sin(time * 0.8) * 0.5;
        meshRef.current.position.y = Math.cos(time * 0.6) * 0.3;
        meshRef.current.rotation.y = Math.sin(time * 0.4) * 0.3;
        meshRef.current.position.z = Math.cos(time * 0.5) * 0.5;
        break;
    }
  });

  const aspectRatio = texture.image ? texture.image.width / texture.image.height : 1;
  const width = aspectRatio > 1 ? 4 : 4 * aspectRatio;
  const height = aspectRatio > 1 ? 4 / aspectRatio : 4;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[width, height, 32, 32]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

function CameraController({ animationType }: { animationType: string }) {
  const { camera } = useThree();
  const [time, setTime] = useState(0);

  useFrame((state, delta) => {
    setTime(t => t + delta);

    if (animationType === 'parallax') {
      camera.position.x = Math.sin(time * 0.5) * 1;
      camera.position.y = Math.cos(time * 0.3) * 0.5;
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

interface Scene3DProps {
  imageUrl: string;
  animationType: 'rotate' | 'wave' | 'zoom' | 'parallax';
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  duration: number;
}

export default function Scene3D({
  imageUrl,
  animationType,
  isRecording,
  setIsRecording,
  duration
}: Scene3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isRecording && canvasRef.current) {
      startRecording();
    }
  }, [isRecording]);

  const startRecording = async () => {
    if (!canvasRef.current) return;

    try {
      const stream = canvasRef.current.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `3d-video-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };

      mediaRecorder.start();

      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, duration * 1000);

    } catch (error) {
      console.error('Recording error:', error);
      setIsRecording(false);
    }
  };

  return (
    <Canvas
      ref={canvasRef}
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ preserveDrawingBuffer: true }}
      style={{ background: 'radial-gradient(circle, #1a1a2e 0%, #0f0f1e 100%)' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#667eea" />
      <spotLight position={[0, 5, 5]} angle={0.3} penumbra={1} intensity={0.5} color="#764ba2" />

      <Suspense fallback={null}>
        <AnimatedImage imageUrl={imageUrl} animationType={animationType} />
      </Suspense>

      <CameraController animationType={animationType} />

      {animationType !== 'parallax' && <OrbitControls enableZoom={false} enablePan={false} />}
    </Canvas>
  );
}
