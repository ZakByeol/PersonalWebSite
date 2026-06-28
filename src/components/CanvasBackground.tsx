import { useEffect, useRef } from 'react';
import { Theme } from '../types';

interface CanvasBackgroundProps {
  theme: Theme;
}

interface Point3D {
  type: 'tetrahedron' | 'cube';
  baseX: number;
  baseY: number;
  baseZ: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  // Local rotation
  localAngleX: number;
  localAngleY: number;
  localAngleZ: number;
  vLocalX: number;
  vLocalY: number;
  vLocalZ: number;
  // Floating behavior
  floatAngleX: number;
  floatAngleY: number;
  floatSpeed: number;
}

export default function CanvasBackground({ theme }: CanvasBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isMoving: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic resizing
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse movement tracker
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.isMoving = true;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Rotation helper
    const rotate3D = (pt: {x: number, y: number, z: number}, ax: number, ay: number, az: number) => {
      // Rotate around X
      let cos = Math.cos(ax);
      let sin = Math.sin(ax);
      let y1 = pt.y * cos - pt.z * sin;
      let z1 = pt.y * sin + pt.z * cos;

      // Rotate around Y
      cos = Math.cos(ay);
      sin = Math.sin(ay);
      let x2 = pt.x * cos + z1 * sin;
      let z2 = -pt.x * sin + z1 * cos;

      // Rotate around Z
      cos = Math.cos(az);
      sin = Math.sin(az);
      let x3 = x2 * cos - y1 * sin;
      let y3 = x2 * sin + y1 * cos;

      return { x: x3, y: y3, z: z2 };
    };

    // Palette Definitions
    const lightColors = [
      'rgba(244, 63, 94, 0.25)',   // Vivid Soft Coral Pink
      'rgba(59, 130, 246, 0.25)',  // Soft Ocean Blue
      'rgba(16, 185, 129, 0.25)',  // Soft Mint
      'rgba(168, 85, 247, 0.25)',  // Soft Lavender Purple
      'rgba(245, 158, 11, 0.25)',  // Soft Tangerine
    ];

    const darkColors = [
      'rgba(244, 63, 94, 0.15)',   // Deep Glowing Ruby Red
      'rgba(168, 85, 247, 0.15)',  // Deep Glowing Indigo Violet
      'rgba(6, 182, 212, 0.15)',   // Deep Glowing Cyan
      'rgba(16, 185, 129, 0.15)',  // Deep Glowing Emerald Green
      'rgba(234, 179, 8, 0.15)',   // Deep Glowing Amber
    ];

    const colors = theme === 'light' ? lightColors : darkColors;

    // Generate 3D floating nodes
    const numPoints = 16;
    const points: Point3D[] = [];

    for (let i = 0; i < numPoints; i++) {
      const baseX = (Math.random() - 0.5) * width * 1.1;
      const baseY = (Math.random() - 0.5) * height * 1.1;
      const baseZ = (Math.random() - 0.5) * 300;
      points.push({
        type: i % 2 === 0 ? 'tetrahedron' : 'cube',
        baseX,
        baseY,
        baseZ,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        vz: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 20 + 20, // size 20px to 40px
        color: colors[i % colors.length],
        localAngleX: Math.random() * Math.PI * 2,
        localAngleY: Math.random() * Math.PI * 2,
        localAngleZ: Math.random() * Math.PI * 2,
        vLocalX: (Math.random() - 0.5) * 0.012,
        vLocalY: (Math.random() - 0.5) * 0.012,
        vLocalZ: (Math.random() - 0.5) * 0.012,
        floatAngleX: Math.random() * Math.PI * 2,
        floatAngleY: Math.random() * Math.PI * 2,
        floatSpeed: 0.0012 + Math.random() * 0.0018,
      });
    }

    // Animation variables
    let globalAngleY = 0;
    let globalAngleX = 0;

    const render = () => {
      ctx.fillStyle = theme === 'light' ? '#FAF9F6' : '#222222';
      ctx.fillRect(0, 0, width, height);

      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const targetAngleY = ((mouse.x / width) - 0.5) * 0.3;
      const targetAngleX = ((mouse.y / height) - 0.5) * 0.3;
      globalAngleY += (targetAngleY - globalAngleY) * 0.05;
      globalAngleX += (targetAngleX - globalAngleX) * 0.05;

      const cosY = Math.cos(globalAngleY);
      const sinY = Math.sin(globalAngleY);
      const cosX = Math.cos(globalAngleX);
      const sinX = Math.sin(globalAngleX);

      // Process and project all shapes
      const projectedShapes = points.map((p) => {
        p.floatAngleX += p.floatSpeed;
        p.floatAngleY += p.floatSpeed * 0.8;
        const driftX = Math.sin(p.floatAngleX) * 25;
        const driftY = Math.cos(p.floatAngleY) * 25;

        p.localAngleX += p.vLocalX;
        p.localAngleY += p.vLocalY;
        p.localAngleZ += p.vLocalZ;

        p.baseX += p.vx;
        p.baseY += p.vy;
        p.baseZ += p.vz;

        const boundX = width * 0.7;
        const boundY = height * 0.7;
        if (Math.abs(p.baseX) > boundX) p.vx *= -1;
        if (Math.abs(p.baseY) > boundY) p.vy *= -1;
        if (Math.abs(p.baseZ) > 300) p.vz *= -1;

        let dx = 0;
        let dy = 0;
        if (mouse.isMoving) {
          const worldMouseX = mouse.x - width / 2;
          const worldMouseY = mouse.y - height / 2;
          const currentX = p.baseX + driftX;
          const currentY = p.baseY + driftY;
          const dist = Math.hypot(currentX - worldMouseX, currentY - worldMouseY);
          if (dist < 300) {
            const force = (300 - dist) / 300;
            dx = (currentX - worldMouseX) * force * 0.12;
            dy = (currentY - worldMouseY) * force * 0.12;
          }
        }

        const currentX = p.baseX + driftX + dx;
        const currentY = p.baseY + driftY + dy;
        const currentZ = p.baseZ;

        const vertices = p.type === 'tetrahedron'
          ? [
              { x: 0, y: -p.size, z: 0 },
              { x: p.size * 0.9428, y: p.size * 0.3333, z: 0 },
              { x: -p.size * 0.4714, y: p.size * 0.3333, z: p.size * 0.8165 },
              { x: -p.size * 0.4714, y: p.size * 0.3333, z: -p.size * 0.8165 }
            ]
          : [
              { x: -p.size * 0.7, y: -p.size * 0.7, z: -p.size * 0.7 },
              { x: p.size * 0.7, y: -p.size * 0.7, z: -p.size * 0.7 },
              { x: p.size * 0.7, y: p.size * 0.7, z: -p.size * 0.7 },
              { x: -p.size * 0.7, y: p.size * 0.7, z: -p.size * 0.7 },
              { x: -p.size * 0.7, y: -p.size * 0.7, z: p.size * 0.7 },
              { x: p.size * 0.7, y: -p.size * 0.7, z: p.size * 0.7 },
              { x: p.size * 0.7, y: p.size * 0.7, z: p.size * 0.7 },
              { x: -p.size * 0.7, y: p.size * 0.7, z: p.size * 0.7 }
            ];

        const transformedVertices = vertices.map((v) => {
          const localRot = rotate3D(v, p.localAngleX, p.localAngleY, p.localAngleZ);

          const wx = currentX + localRot.x;
          const wy = currentY + localRot.y;
          const wz = currentZ + localRot.z;

          const rx = wx * cosY - wz * sinY;
          const rz1 = wx * sinY + wz * cosY;
          const ry = wy * cosX - rz1 * sinX;
          const rz = wy * sinX + rz1 * cosX;

          const focalLength = 800;
          const scale = focalLength / (focalLength + rz);
          const px = rx * scale + width / 2;
          const py = ry * scale + height / 2;

          return { px, py, pz: rz, scale };
        });

        const faceIndices = p.type === 'tetrahedron'
          ? [
              [0, 1, 2],
              [0, 2, 3],
              [0, 3, 1],
              [1, 3, 2]
            ]
          : [
              [0, 1, 2, 3], // back
              [4, 5, 6, 7], // front
              [0, 1, 5, 4], // top
              [2, 3, 7, 6], // bottom
              [0, 3, 7, 4], // left
              [1, 2, 6, 5]  // right
            ];

        const projectedFaces = faceIndices.map((indices) => {
          const avgZ = indices.reduce((sum, idx) => sum + transformedVertices[idx].pz, 0) / indices.length;
          
          const points2D = indices.map(idx => ({
            x: transformedVertices[idx].px,
            y: transformedVertices[idx].py,
          }));

          const p0 = transformedVertices[indices[0]];
          const p1 = transformedVertices[indices[1]];
          const p2 = transformedVertices[indices[2]];
          
          const ux = p1.px - p0.px;
          const uy = p1.py - p0.py;
          const uz = p1.pz - p0.pz;
          const vx = p2.px - p0.px;
          const vy = p2.py - p0.py;
          const vz = p2.pz - p0.pz;

          const nx = uy * vz - uz * vy;
          const ny = uz * vx - ux * vz;
          const nz = ux * vy - uy * vx;
          const len = Math.hypot(nx, ny, nz);
          
          let lightIntensity = 0.5;
          if (len > 0) {
            const normalX = nx / len;
            const normalY = ny / len;
            const normalZ = nz / len;
            // Shading relative to a top-left-front light source
            const dot = normalX * (-0.4) + normalY * (-0.4) + normalZ * (-0.82);
            lightIntensity = 0.3 + (dot + 1) * 0.35;
          }

          return {
            points2D,
            avgZ,
            lightIntensity,
            scale: transformedVertices[indices[0]].scale,
          };
        });

        const avgShapeZ = transformedVertices.reduce((sum, v) => sum + v.pz, 0) / transformedVertices.length;

        return {
          avgShapeZ,
          projectedFaces,
          color: p.color,
          size: p.size,
        };
      });

      // Painter's algorithm for shapes
      projectedShapes.sort((a, b) => b.avgShapeZ - a.avgShapeZ);

      projectedShapes.forEach((s) => {
        // Painter's algorithm for faces
        s.projectedFaces.sort((a, b) => b.avgZ - a.avgZ);

        s.projectedFaces.forEach((f) => {
          if (f.points2D.length < 3) return;

          // Configure line join and cap for highly rounded cushion-like corners
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          
          // Thicker stroke width (0.4 * size) yields incredibly smooth, rounded corners (claymorphic/puffy style)
          const lineWidth = s.size * 0.42 * f.scale;
          ctx.lineWidth = lineWidth > 1 ? lineWidth : 1;

          // Base color
          ctx.fillStyle = s.color;
          ctx.strokeStyle = s.color;

          // Draw round edge face
          ctx.beginPath();
          ctx.moveTo(f.points2D[0].x, f.points2D[0].y);
          for (let i = 1; i < f.points2D.length; i++) {
            ctx.lineTo(f.points2D[i].x, f.points2D[i].y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Apply 3D volumetric light shading (both filled and stroked to maintain the rounded profile)
          ctx.beginPath();
          ctx.moveTo(f.points2D[0].x, f.points2D[0].y);
          for (let i = 1; i < f.points2D.length; i++) {
            ctx.lineTo(f.points2D[i].x, f.points2D[i].y);
          }
          ctx.closePath();

          let shadingColor = '';
          if (f.lightIntensity > 0.5) {
            const alpha = (f.lightIntensity - 0.5) * 0.48;
            shadingColor = `rgba(255, 255, 255, ${alpha})`;
          } else {
            const alpha = (0.5 - f.lightIntensity) * 0.58;
            shadingColor = `rgba(0, 0, 0, ${alpha})`;
          }
          
          ctx.fillStyle = shadingColor;
          ctx.strokeStyle = shadingColor;
          ctx.fill();
          ctx.stroke();

          // Subtle glassmorphic inner/outer highlight
          ctx.beginPath();
          ctx.moveTo(f.points2D[0].x, f.points2D[0].y);
          for (let i = 1; i < f.points2D.length; i++) {
            ctx.lineTo(f.points2D[i].x, f.points2D[i].y);
          }
          ctx.closePath();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = theme === 'light' 
            ? 'rgba(255, 255, 255, 0.5)' 
            : 'rgba(255, 255, 255, 0.16)';
          ctx.stroke();
        });
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      id="interactive-bg-canvas"
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 block transition-colors duration-1000"
    />
  );
}
