import { useEffect, useRef, useState } from 'react';

export function useCanvasSequence(frameCount: number, folderPath: string) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const imgArray: HTMLImageElement[] = [];

    // The frames are named like "frame_000_delay-0.067s.webp"
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      const frameIndex = i.toString().padStart(3, '0');
      img.src = `${folderPath}/frame_${frameIndex}_delay-0.067s.webp`;
      
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setLoaded(true);
        }
      };
      
      img.onerror = () => {
        console.error(`Failed to load frame ${i}`);
        // Even if some fail, we can try to proceed
        loadedCount++;
        if (loadedCount === frameCount) {
          setLoaded(true);
        }
      }
      
      imgArray.push(img);
    }
    
    setImages(imgArray);
  }, [frameCount, folderPath]);

  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0 || !images[frameIndex]) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = images[frameIndex];
    
    // Set canvas dimensions to window size if not set
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    // Object-fit: cover logic
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;

    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      // Canvas is wider than image
      drawHeight = canvas.width / imgRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      // Canvas is taller than image
      drawWidth = canvas.height * imgRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  return { canvasRef, drawFrame, loaded };
}
