'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';

const Scene3D = dynamic(() => import('./components/Scene3D'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen"><p className="text-white">Loading 3D Engine...</p></div>
});

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [animationType, setAnimationType] = useState<'rotate' | 'wave' | 'zoom' | 'parallax'>('rotate');
  const [duration, setDuration] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-4">
          3D Image to Video
        </h1>
        <p className="text-white text-center mb-8 opacity-90">
          Transform your images into stunning 3D animated videos for social media
        </p>

        {!imageUrl ? (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-white/50 rounded-2xl p-16 text-center cursor-pointer hover:border-white transition-all bg-white/10 backdrop-blur-sm"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="text-white">
              <svg className="w-24 h-24 mx-auto mb-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-2xl font-semibold mb-2">Drop an image here or click to upload</p>
              <p className="text-sm opacity-70">Supports JPG, PNG, GIF</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Animation Style</label>
                  <select
                    value={animationType}
                    onChange={(e) => setAnimationType(e.target.value as any)}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="rotate">3D Rotate</option>
                    <option value="wave">Wave Motion</option>
                    <option value="zoom">Zoom In/Out</option>
                    <option value="parallax">Parallax Depth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Duration (seconds)</label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                <button
                  onClick={() => {
                    setImageUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="self-end px-6 py-2 rounded-lg bg-white/20 text-white font-semibold hover:bg-white/30 transition-all border border-white/30"
                >
                  Change Image
                </button>

                <button
                  onClick={() => setIsRecording(!isRecording)}
                  disabled={isRecording}
                  className={`self-end px-6 py-2 rounded-lg font-semibold transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white cursor-not-allowed'
                      : 'bg-white text-purple-600 hover:bg-gray-100'
                  }`}
                >
                  {isRecording ? 'Recording...' : 'Record Video'}
                </button>
              </div>

              <div className="bg-black rounded-xl overflow-hidden" style={{ height: '600px' }}>
                <Scene3D
                  imageUrl={imageUrl}
                  animationType={animationType}
                  isRecording={isRecording}
                  setIsRecording={setIsRecording}
                  duration={duration}
                />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg mb-3">How it works:</h3>
              <ol className="text-white/90 space-y-2 list-decimal list-inside">
                <li>Your image is mapped onto a 3D plane with depth effects</li>
                <li>Choose an animation style that matches your content</li>
                <li>Set the duration for your video (3-15 seconds)</li>
                <li>Click "Record Video" to capture the animation</li>
                <li>The video will be automatically downloaded to your device</li>
              </ol>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white/80 text-sm">
              <div className="bg-white/10 p-4 rounded-lg text-center">
                <p className="font-semibold mb-1">9:16</p>
                <p className="text-xs opacity-70">Instagram Stories</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg text-center">
                <p className="font-semibold mb-1">1:1</p>
                <p className="text-xs opacity-70">Instagram Post</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg text-center">
                <p className="font-semibold mb-1">9:16</p>
                <p className="text-xs opacity-70">TikTok</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg text-center">
                <p className="font-semibold mb-1">16:9</p>
                <p className="text-xs opacity-70">YouTube</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
