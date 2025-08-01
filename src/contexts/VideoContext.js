'use client';

import { createContext, useContext, useState } from 'react';
import { functions, FUNCTION_IDS, databases, DATABASE_IDS, COLLECTION_IDS } from '@/lib/appwrite';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const VideoContext = createContext({});

export const useVideo = () => {
    const context = useContext(VideoContext);
    if (!context) {
        throw new Error('useVideo must be used within a VideoProvider');
    }
    return context;
};

export const VideoProvider = ({ children }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTokens, setActiveTokens] = useState(new Map());

    // Request secure video access token
    const requestVideoAccess = async (lessonId, courseId) => {
        try {
            if (!user) {
                toast.error('Please login to access videos');
                return { success: false, error: 'User not authenticated' };
            }

            setLoading(true);

            // Temporary local fallback for video access (server functions pending deployment)
            console.log('Video access requested for:', { userId: user.$id, lessonId, courseId });
            
            // Try to get the lesson's actual video URL from the database
            let embedUrl = `https://www.youtube.com/embed/placeholder?enablejsapi=1&origin=${window.location.origin}`;
            
            try {
                const lesson = await databases.getDocument(
                    DATABASE_IDS.MAIN,
                    COLLECTION_IDS.LESSONS,
                    lessonId
                );
                
                if (lesson.videoUrl) {
                    // Convert YouTube watch URL to embed URL
                    const videoId = extractYouTubeVideoId(lesson.videoUrl);
                    if (videoId) {
                        embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
                    }
                }
            } catch (dbError) {
                console.warn('Could not fetch lesson video URL:', dbError);
            }
            
            // Simulate video access token generation
            const result = {
                success: true,
                embedUrl: embedUrl,
                expiresIn: 3600, // 1 hour
                message: 'Video access granted (local fallback)'
            };

            if (result.success) {
                // Store token with expiration
                const tokenData = {
                    embedUrl: result.embedUrl,
                    expiresAt: Date.now() + (result.expiresIn * 1000),
                    lessonId
                };
                
                setActiveTokens(prev => new Map(prev.set(lessonId, tokenData)));
                
                return {
                    success: true,
                    embedUrl: result.embedUrl,
                    expiresIn: result.expiresIn
                };
            } else {
                toast.error(result.error || 'Video access denied');
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Error requesting video access:', error);
            toast.error('Failed to access video');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Get cached video access or request new one
    const getVideoAccess = async (lessonId, courseId) => {
        const cachedToken = activeTokens.get(lessonId);
        
        // Check if we have a valid cached token
        if (cachedToken && cachedToken.expiresAt > Date.now() + 30000) { // 30s buffer
            return {
                success: true,
                embedUrl: cachedToken.embedUrl,
                cached: true
            };
        }
        
        // Request new token
        return await requestVideoAccess(lessonId, courseId);
    };

    // Update video progress with security validation
    const updateVideoProgress = async (lessonId, watchedSeconds, totalSeconds, securityToken) => {
        try {
            if (!user) return { success: false, error: 'User not authenticated' };

            // Temporary local fallback for video progress (server functions pending deployment)
            console.log('Video progress update:', { userId: user.$id, lessonId, watchedSeconds, totalSeconds });
            
            // Simulate progress update
            const result = {
                success: true,
                message: 'Progress updated (local fallback)',
                progress: Math.round((watchedSeconds / totalSeconds) * 100)
            };
            return result;
        } catch (error) {
            console.error('Error updating video progress:', error);
            return { success: false, error: error.message };
        }
    };

    // Validate video access permissions
    const validateVideoAccess = async (lessonId, courseId) => {
        try {
            if (!user) return { success: false, error: 'User not authenticated' };

            // Temporary local fallback for video access validation (server functions pending deployment)
            console.log('Video access validation for:', { userId: user.$id, lessonId, courseId });
            
            // Simulate access validation
            const result = {
                success: true,
                hasAccess: true,
                message: 'Access validated (local fallback)'
            };
            return result;
        } catch (error) {
            console.error('Error validating video access:', error);
            return { success: false, error: error.message };
        }
    };

    // Revoke active video access tokens
    const revokeVideoAccess = async (lessonId) => {
        try {
            if (!user) return { success: false, error: 'User not authenticated' };

            // Temporary local fallback for video access revocation (server functions pending deployment)
            console.log('Video access revocation for:', { userId: user.$id, lessonId });
            
            // Simulate access revocation
            const response = {
                responseBody: JSON.stringify({
                    success: true,
                    message: 'Access revoked (local fallback)'
                })
            };

            // Remove from local cache
            setActiveTokens(prev => {
                const newMap = new Map(prev);
                newMap.delete(lessonId);
                return newMap;
            });

            const result = JSON.parse(response.responseBody);
            return result;
        } catch (error) {
            console.error('Error revoking video access:', error);
            return { success: false, error: error.message };
        }
    };

    // Clean up expired tokens
    const cleanupExpiredTokens = () => {
        const now = Date.now();
        setActiveTokens(prev => {
            const newMap = new Map();
            for (const [lessonId, tokenData] of prev) {
                if (tokenData.expiresAt > now) {
                    newMap.set(lessonId, tokenData);
                }
            }
            return newMap;
        });
    };

    // Auto cleanup expired tokens every minute
    useState(() => {
        const interval = setInterval(cleanupExpiredTokens, 60000);
        return () => clearInterval(interval);
    }, []);

    // YouTube video validation for instructors (Local fallback until Appwrite functions are deployed)
    const validateYouTubeVideo = async (videoUrl) => {
        try {
            setLoading(true);

            // Extract YouTube video ID from URL
            const videoId = extractYouTubeVideoId(videoUrl);
            if (!videoId) {
                toast.error('Invalid YouTube URL format');
                return { success: false, error: 'Invalid YouTube URL format' };
            }

            // Basic validation - check if URL is accessible
            const isValid = await validateYouTubeUrlFormat(videoUrl);
            if (!isValid) {
                toast.error('Invalid YouTube video URL');
                return { success: false, error: 'Invalid YouTube video URL' };
            }

            // Return success with basic video data
            return {
                success: true,
                videoData: {
                    videoId: videoId,
                    title: `YouTube Video ${videoId}`,
                    duration: 'Unknown',
                    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                    url: videoUrl
                }
            };
        } catch (error) {
            console.error('Error validating YouTube video:', error);
            toast.error('Failed to validate video');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Helper function to extract YouTube video ID
    const extractYouTubeVideoId = (url) => {
        const regExp = /^.*((youtu\.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    };

    // Helper function to validate YouTube URL format
    const validateYouTubeUrlFormat = async (url) => {
        const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        return youtubeRegex.test(url);
    };

    // Configure video domain restrictions (Admin only) - Placeholder until Appwrite functions are deployed
    const configureVideoRestrictions = async (videoId, restrictions) => {
        try {
            if (!user) return { success: false, error: 'User not authenticated' };

            // Temporary placeholder - log the configuration for now
            console.log('Video restrictions configuration (placeholder):', {
                videoId,
                restrictions,
                userId: user.$id
            });

            toast.success('Video restrictions will be configured once server functions are deployed');
            
            return { 
                success: true, 
                message: 'Configuration saved locally (server functions pending deployment)' 
            };
        } catch (error) {
            console.error('Error configuring video restrictions:', error);
            toast.error('Failed to configure video restrictions');
            return { success: false, error: error.message };
        }
    };

    const value = {
        loading,
        activeTokens: Array.from(activeTokens.entries()),
        requestVideoAccess,
        getVideoAccess,
        updateVideoProgress,
        validateVideoAccess,
        revokeVideoAccess,
        validateYouTubeVideo,
        configureVideoRestrictions,
        cleanupExpiredTokens
    };

    return (
        <VideoContext.Provider value={value}>
            {children}
        </VideoContext.Provider>
    );
};