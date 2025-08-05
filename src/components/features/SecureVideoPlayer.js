import React, { useRef, useEffect, useState } from 'react';
import { useVideoContext } from '../../contexts/VideoContext';
import { logVideoAccess } from '../../lib/videoSecurity';

const SecureVideoPlayer = ({ videoId, courseId, lessonId }) => {
  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [watchTimeInterval, setWatchTimeInterval] = useState(null);
  const { updateWatchTime, checkVideoAccess } = useVideoContext();

  useEffect(() => {
    if (!videoId) return;
    
    // Check video access before loading
    const checkAccess = async () => {
      const hasAccess = await checkVideoAccess(courseId, lessonId);
      if (!hasAccess) {
        console.error('Access denied to video');
        return;
      }
      
      // Load YouTube IFrame API
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = initializePlayer;

      if (window.YT && window.YT.Player) {
        initializePlayer();
      }
    };
    
    checkAccess();

    return () => {
      if (player) {
        player.destroy();
      }
      if (watchTimeInterval) {
        clearInterval(watchTimeInterval);
      }
    };
  }, [videoId, courseId, lessonId]);

  const initializePlayer = () => {
    const newPlayer = new window.YT.Player(playerRef.current, {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        disablekb: 1,        // Disable keyboard shortcuts
        fs: 0,               // Disable fullscreen
        iv_load_policy: 3,   // Disable annotations
        modestbranding: 1,   // Minimize YouTube branding
        rel: 0,              // Don't show related videos
        showinfo: 0,         // Hide video title
        cc_load_policy: 0,   // Disable captions by default
        hl: 'en',
        origin: window.location.origin
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    });
    setPlayer(newPlayer);
  };

  const onPlayerReady = (event) => {
    setIsPlayerReady(true);
    // Additional security: Hide download button via CSS
    hideDownloadButton();
    // Log video access
    logVideoAccess(null, courseId, lessonId, 'ready');
  };

  const onPlayerStateChange = (event) => {
    // Track watch time for progress
    if (event.data === window.YT.PlayerState.PLAYING) {
      startWatchTimeTracking();
      logVideoAccess(null, courseId, lessonId, 'play');
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      stopWatchTimeTracking();
      logVideoAccess(null, courseId, lessonId, 'pause');
    } else if (event.data === window.YT.PlayerState.ENDED) {
      stopWatchTimeTracking();
      logVideoAccess(null, courseId, lessonId, 'complete');
    }
  };

  const onPlayerError = (event) => {
    console.error('YouTube Player Error:', event.data);
  };

  const hideDownloadButton = () => {
    const style = document.createElement('style');
    style.textContent = `
      .ytp-button[data-tooltip-target-id="ytp-watch-later-button"],
      .ytp-button[data-tooltip-target-id="ytp-share-button"],
      .ytp-watch-later-button,
      .ytp-share-button,
      .ytp-copylink-button {
        display: none !important;
      }
      .ytp-chrome-top {
        display: none !important;
      }
      .ytp-show-cards-title {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  };

  const startWatchTimeTracking = () => {
    if (watchTimeInterval) {
      clearInterval(watchTimeInterval);
    }
    
    const interval = setInterval(() => {
      if (player && typeof player.getCurrentTime === 'function') {
        const currentTime = player.getCurrentTime();
        updateWatchTime(courseId, lessonId, Math.floor(currentTime));
      }
    }, 5000); // Update every 5 seconds
    
    setWatchTimeInterval(interval);
  };

  const stopWatchTimeTracking = () => {
    if (watchTimeInterval) {
      clearInterval(watchTimeInterval);
      setWatchTimeInterval(null);
    }
  };

  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <p className="text-gray-600">Invalid video ID</p>
      </div>
    );
  }

  return (
    <div className="relative w-full video-container" style={{ paddingBottom: '56.25%', height: 0 }}>
      <div 
        ref={playerRef}
        className="absolute top-0 left-0 w-full h-full rounded-lg overflow-hidden"
        style={{ pointerEvents: 'auto' }}
      />
      {/* Security overlay to prevent right-click and interactions */}
      <div 
        className="secure-video-overlay"
        onContextMenu={(e) => e.preventDefault()}
        onSelectStart={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{ zIndex: 1 }}
      />
      {!isPlayerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <div className="text-white">Loading secure video player...</div>
        </div>
      )}
    </div>
  );
};

export default SecureVideoPlayer;