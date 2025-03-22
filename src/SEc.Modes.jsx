import React, { useEffect, useRef } from 'react';
import { ethers } from 'ethers';

export function DrawMode({ onHash, walletConnected }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    // Create canvas element with a transparent background
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    canvas.style.backgroundColor = 'transparent';
    container.appendChild(canvas);
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#FFFFFF';

    let drawing = false;
    let path = [];

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      let x, y;
      if (e.touches && e.touches[0]) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      return { x, y };
    };

    const startDrawing = (e) => {
      if (!walletConnected) {
        alert("Please connect your wallet before drawing!");
        return;
      }
      drawing = true;
      path = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pos = getPos(e);
      path.push(pos);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      console.log("DrawMode: Start Drawing at", pos);
    };

    const draw = (e) => {
      if (!drawing) return;
      const pos = getPos(e);
      path.push(pos);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const endDrawing = () => {
      if (!drawing) return;
      drawing = false;
      const dataString = JSON.stringify(path);
      console.log("DrawMode: Gesture Data:", dataString);
      const computedHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(dataString)
      );
      console.log("DrawMode: Computed Hash:", computedHash);
      onHash && onHash(computedHash);
      // 3D rotate animation for visual flair
      canvas.style.transition = 'transform 0.5s ease-out';
      canvas.style.transform = 'rotateY(360deg)';
      setTimeout(() => {
        canvas.style.transform = 'rotateY(0deg)';
      }, 500);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('mouseup', endDrawing);
    canvas.addEventListener('touchend', endDrawing);

    const handleResize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('mouseup', endDrawing);
      canvas.removeEventListener('touchend', endDrawing);
      container.removeChild(canvas);
    };
  }, [onHash, walletConnected]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

export function ClickMode({ onHash, walletConnected }) {
  const containerRef = useRef(null);
  const numCircles = 5;
  const clickSequenceRef = useRef([]);
  const circlesRef = useRef([]);

  useEffect(() => {
    if (!walletConnected) {
      return;
    }
    const container = containerRef.current;
    clickSequenceRef.current = [];
    circlesRef.current = [];
    container.innerHTML = ''; // Clear previous content

    for (let i = 0; i < numCircles; i++) {
      const circle = document.createElement('div');
      circle.className = 'circle';
      Object.assign(circle.style, {
        position: 'absolute',
        width: '50px',
        height: '50px',
        background: '#6c63ff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s, background 0.2s',
      });
      const maxX = container.clientWidth - 50;
      const maxY = container.clientHeight - 50;
      const x = Math.random() * maxX;
      const y = Math.random() * maxY;
      circle.style.left = `${x}px`;
      circle.style.top = `${y}px`;
      circle.dataset.index = i;
      circle.innerText = i + 1;

      circle.addEventListener('click', () => {
        if (!walletConnected) {
          alert("Please connect your wallet before clicking!");
          return;
        }
        if (circle.classList.contains('active')) return;
        circle.classList.add('active');
        circle.style.background = '#ff6584';
        circle.style.transform = 'scale(1.2)';
        clickSequenceRef.current.push(i);
        console.log("ClickMode: Current Click Sequence:", clickSequenceRef.current);
        if (clickSequenceRef.current.length === numCircles) {
          const dataString = JSON.stringify(clickSequenceRef.current);
          console.log("ClickMode: Click Data:", dataString);
          const computedHash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(dataString)
          );
          console.log("ClickMode: Computed Hash:", computedHash);
          onHash && onHash(computedHash);
        }
      });

      container.appendChild(circle);
      circlesRef.current.push(circle);
    }
  }, [onHash, walletConnected]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    />
  );
}
