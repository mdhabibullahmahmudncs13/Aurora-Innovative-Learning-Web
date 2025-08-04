'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

const CustomVideoPlayer = React.forwardRef(({ 
  url, 
  onProgress, 
  onError, 
  onReady,
  width = '100%',
  height = '100%'
}, ref) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeVideoId(url);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!videoId) return;

    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

      if (!window.onYouTubeIframeAPIReady) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
          initializePlayer();
        };
      }
    };

    const initializePlayer = () => {
      if (!playerRef.current) return;

      const newPlayer = new window.YT.Player(playerRef.current, {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          controls: 0, // Hide all YouTube controls
          disablekb: 1, // Disable YouTube keyboard shortcuts
          fs: 0, // Disable fullscreen button
          modestbranding: 1, // Hide YouTube logo
          rel: 0, // Don't show related videos
          iv_load_policy: 3, // Hide annotations
          cc_load_policy: 0, // Hide captions
          showinfo: 0, // Hide video info
          playsinline: 1,
          origin: window.location.origin,
          enablejsapi: 1, // Enable JS API for better control
          widget_referrer: window.location.origin // Prevent external referrers
        },
        events: {
          onReady: (event) => {
            setPlayer(event.target);
            setIsReady(true);
            event.target.setVolume(volume);
            if (onReady) onReady();
          },
          onStateChange: (event) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
            
            // Progress tracking
            if (event.data === window.YT.PlayerState.PLAYING && onProgress) {
              const updateProgress = () => {
                if (player && player.getCurrentTime && player.getDuration) {
                  const currentTime = player.getCurrentTime();
                  const duration = player.getDuration();
                  if (duration > 0) {
                    onProgress({
                      played: currentTime / duration,
                      playedSeconds: currentTime,
                      loaded: player.getVideoLoadedFraction(),
                      loadedSeconds: player.getVideoLoadedFraction() * duration
                    });
                  }
                }
              };
              
              const progressInterval = setInterval(() => {
                if (player && player.getPlayerState() === window.YT.PlayerState.PLAYING) {
                  updateProgress();
                } else {
                  clearInterval(progressInterval);
                }
              }, 1000);
            }
          },
          onError: (event) => {
            setError('Failed to load YouTube video');
            if (onError) onError(event);
          }
        }
      });
    };

    loadYouTubeAPI();

    return () => {
      if (player && player.destroy) {
        player.destroy();
      }
    };
  }, [videoId, onReady, onError, onProgress]);

  // Custom keyboard controls
  const handleKeyDown = useCallback((event) => {
    if (!player || !isReady) return;

    const { key, code } = event;
    
    // Prevent default browser behavior for our custom shortcuts
    const customKeys = ['Space', 'KeyK', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyF', 'KeyJ', 'KeyL', 'KeyM'];
    if (customKeys.includes(code) || key === ' ') {
      event.preventDefault();
    }

    switch (code) {
      case 'Space':
      case 'KeyK':
        // Play/Pause
        if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
          player.pauseVideo();
        } else {
          player.playVideo();
        }
        break;
        
      case 'ArrowLeft':
        // Jump back 5 seconds
        const currentTime = player.getCurrentTime();
        player.seekTo(Math.max(0, currentTime - 5), true);
        break;
        
      case 'ArrowRight':
        // Jump ahead 5 seconds
        const currentTimeRight = player.getCurrentTime();
        const duration = player.getDuration();
        player.seekTo(Math.min(duration, currentTimeRight + 5), true);
        break;
        
      case 'ArrowUp':
        // Volume up
        const currentVolumeUp = player.getVolume();
        const newVolumeUp = Math.min(100, currentVolumeUp + 10);
        player.setVolume(newVolumeUp);
        setVolume(newVolumeUp);
        if (isMuted && newVolumeUp > 0) {
          player.unMute();
          setIsMuted(false);
        }
        break;
        
      case 'ArrowDown':
        // Volume down
        const currentVolumeDown = player.getVolume();
        const newVolumeDown = Math.max(0, currentVolumeDown - 10);
        player.setVolume(newVolumeDown);
        setVolume(newVolumeDown);
        break;
        
      case 'KeyF':
        // Toggle fullscreen
        if (containerRef.current) {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            containerRef.current.requestFullscreen();
          }
        }
        break;
        
      case 'KeyJ':
        // Jump back 10 seconds
        const currentTimeJ = player.getCurrentTime();
        player.seekTo(Math.max(0, currentTimeJ - 10), true);
        break;
        
      case 'KeyL':
        // Jump ahead 10 seconds
        const currentTimeL = player.getCurrentTime();
        const durationL = player.getDuration();
        player.seekTo(Math.min(durationL, currentTimeL + 10), true);
        break;
        
      case 'KeyM':
        // Mute/unmute
        if (isMuted) {
          player.unMute();
          setIsMuted(false);
        } else {
          player.mute();
          setIsMuted(true);
        }
        break;
    }
  }, [player, isReady, isMuted, volume]);

  // Add keyboard event listeners
  useEffect(() => {
    if (!isReady) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, isReady]);

  // Manual control functions
  const togglePlayPause = () => {
    if (!player || !isReady) return;
    if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const changePlaybackRate = () => {
    if (!player || !isReady) return;
    const rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    player.setPlaybackRate(newRate);
    setPlaybackRate(newRate);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const toggleMute = () => {
    if (!player || !isReady) return;
    if (isMuted) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const adjustVolume = (delta) => {
    if (!player || !isReady) return;
    const currentVol = player.getVolume();
    const newVol = Math.max(0, Math.min(100, currentVol + delta));
    player.setVolume(newVol);
    setVolume(newVol);
    if (isMuted && newVol > 0) {
      player.unMute();
      setIsMuted(false);
    }
  };

  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Expose control functions through ref
  React.useImperativeHandle(ref, () => ({
    togglePlayPause,
    changePlaybackRate,
    toggleFullscreen,
    toggleMute,
    adjustVolume,
    isPlaying,
    playbackRate,
    isFullscreen,
    isMuted,
    volume,
    isReady
  }), [togglePlayPause, changePlaybackRate, toggleFullscreen, toggleMute, adjustVolume, isPlaying, playbackRate, isFullscreen, isMuted, volume, isReady]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <p className="text-gray-600">Please provide a valid YouTube URL</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black rounded-lg overflow-hidden focus:outline-none"
      style={{ width, height }}
      tabIndex={0}
      onContextMenu={(e) => e.preventDefault()} // Disable right-click context menu
    >
      {/* YouTube Player */}
      <div ref={playerRef} className="w-full h-full" />
      
      {/* Loading state */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white">Loading YouTube player...</div>
        </div>
      )}
      

       
       {/* Complete overlay to block all iframe interactions */}
       <div 
         className="absolute inset-0 bg-transparent pointer-events-auto z-10"
         onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
         onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
         onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
         onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
         onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
         onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
         onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); }}
       />
     </div>
   );
});

export default CustomVideoPlayer;