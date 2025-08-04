'use client';

import React from 'react';

const VideoControls = ({ 
  isPlaying, 
  playbackRate, 
  isFullscreen, 
  isMuted, 
  volume, 
  onTogglePlayPause, 
  onChangePlaybackRate, 
  onToggleFullscreen, 
  onToggleMute, 
  onAdjustVolume 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-4">
      {/* Main Controls Row */}
      <div className="flex items-center justify-center space-x-4 mb-3">
        {/* Play/Pause Button */}
        <button
          onClick={onTogglePlayPause}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <span className="text-lg">{isPlaying ? '⏸️' : '▶️'}</span>
          <span className="text-sm">{isPlaying ? 'Pause' : 'Play'}</span>
        </button>
        
        {/* Speed Control */}
        <button
          onClick={onChangePlaybackRate}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <span className="text-lg">⚡</span>
          <span className="text-sm">{playbackRate}x</span>
        </button>
        
        {/* Fullscreen Button */}
        <button
          onClick={onToggleFullscreen}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <span className="text-lg">{isFullscreen ? '🗗' : '⛶'}</span>
          <span className="text-sm">{isFullscreen ? 'Exit' : 'Full'}</span>
        </button>
        
        {/* Mute Button */}
        <button
          onClick={onToggleMute}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <span className="text-lg">{isMuted ? '🔇' : '🔊'}</span>
          <span className="text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>
      </div>
      
      {/* Volume Controls */}
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => onAdjustVolume(-10)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Vol -
        </button>
        <span className="text-gray-700 text-sm min-w-[60px] text-center">
          Vol: {volume}%
        </span>
        <button
          onClick={() => onAdjustVolume(10)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Vol +
        </button>
      </div>
      
      {/* Keyboard Shortcuts Info */}
      <div className="mt-3 text-center text-xs text-gray-500">
        <div className="mb-1">Keyboard: Space/K (Play) • ←/→ (5s) • J/L (10s) • ↑/↓ (Vol) • F (Full) • M (Mute)</div>
      </div>
    </div>
  );
};

export default VideoControls;