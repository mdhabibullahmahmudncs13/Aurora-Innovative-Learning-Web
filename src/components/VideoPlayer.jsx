'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const CustomVideoPlayer = ({ 
  url, 
  onProgress, 
  onError, 
  onReady,
  width = '100%',
  height = '100%'
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout;
    if (isPlaying && showControls) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setLoading(false);
      if (onReady) onReady();
    };

    const handleTimeUpdate = () => {
      if (onProgress) {
        onProgress({
          played: video.currentTime / video.duration,
          playedSeconds: video.currentTime,
          loaded: video.buffered.length > 0 ? video.buffered.end(0) / video.duration : 0,
          loadedSeconds: video.buffered.length > 0 ? video.buffered.end(0) : 0
        });
      }
    };

    const handleError = (e) => {
      setError('Failed to load video');
      setLoading(false);
      if (onError) onError(e);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onError, onReady]);

  // Extract video ID from URL and convert to embed format
  const getVideoSource = (url) => {
    if (!url) return null;
    
    // Handle YouTube URLs
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch) {
      // For YouTube, we'll use an iframe with restricted parameters
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3001';
      return {
        type: 'youtube',
        id: youtubeMatch[1],
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&controls=1&disablekb=1&fs=0&modestbranding=1&rel=0&iv_load_policy=3&cc_load_policy=0&origin=${origin}`
      };
    }
    
    // Handle Google Drive URLs
    const googleDriveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const googleDriveMatch = url.match(googleDriveRegex);
    
    if (googleDriveMatch) {
      // For Google Drive, convert to embed format
      return {
        type: 'googledrive',
        id: googleDriveMatch[1],
        embedUrl: `https://drive.google.com/file/d/${googleDriveMatch[1]}/preview`
      };
    }
    
    // Handle direct video URLs (MP4, WebM, etc.)
    return {
      type: 'direct',
      url: url
    };
  };

  const videoSource = getVideoSource(url);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (e) => {
    const newRate = parseFloat(e.target.value);
    setPlaybackRate(newRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-lg mb-2">Error loading video</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!videoSource) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <p>No video source provided</p>
      </div>
    );
  }

  // For YouTube videos, use iframe with security restrictions
  if (videoSource.type === 'youtube') {
    return (
      <div className="relative w-full h-full bg-black" style={{ width, height }}>
        <iframe
          src={videoSource.embedUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={false}
          className="w-full h-full"
          onLoad={() => {
            setLoading(false);
            if (onReady) onReady();
          }}
        />
        {/* Enhanced security overlays to completely block sharing options */}
        {/* Block YouTube logo and menu button (top-right) */}
        <div 
          className="absolute top-0 right-0 w-24 h-16 bg-transparent z-50"
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />
        {/* Block title area and watch on YouTube link (top area) */}
        <div 
          className="absolute top-0 left-0 right-0 h-20 bg-transparent z-50"
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />
        {/* Block bottom control bar sharing options */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-12 bg-transparent z-50"
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />
        {/* Full overlay to catch any missed interactions */}
        <div 
          className="absolute inset-0 bg-transparent z-40"
          style={{ pointerEvents: 'none' }}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />
      </div>
    );
  }

  // For Google Drive videos, use iframe
  if (videoSource.type === 'googledrive') {
    return (
      <div className="relative w-full h-full bg-black" style={{ width, height }}>
        <iframe
          src={videoSource.embedUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay"
          className="w-full h-full"
          onLoad={() => {
            setLoading(false);
            if (onReady) onReady();
          }}
        />
        {/* Enhanced security overlays to disable pop-out button and sharing options */}
        {/* Block top-right area where pop-out button appears */}
        <div 
          className="absolute top-0 right-0 w-24 h-16 bg-transparent z-50"
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />
        {/* Block title area and any top controls */}
        <div 
          className="absolute top-0 left-0 right-0 h-20 bg-transparent z-50"
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />
        {/* Block bottom control bar */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-12 bg-transparent z-50"
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />
        {/* Full overlay to catch any missed interactions */}
        <div 
          className="absolute inset-0 bg-transparent z-40"
          style={{ pointerEvents: 'none' }}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />
      </div>
    );
  }

  // For direct video files, use custom HTML5 video player
  return (
    <div 
      className="relative w-full h-full bg-black group"
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoSource.url}
        className="w-full h-full"
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()} // Disable right-click
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Custom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-6 text-white">
          {/* Play/Pause */}
          <button onClick={togglePlay} className="hover:text-blue-400 transition-colors">
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </button>

          {/* Speed Control */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Speed:</span>
            <select
              value={playbackRate}
              onChange={handleSpeedChange}
              className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
            >
              <option value={0.25}>0.25x</option>
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={1.75}>1.75x</option>
              <option value={2}>2x</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;