'use client';

import { createContext, useContext, useState } from 'react';
import { functions, FUNCTION_IDS } from '@/lib/appwrite';
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

            // Call secure video access function
            const response = await functions.createExecution(
                FUNCTION_IDS.VIDEO_ACCESS_TOKEN,
                JSON.stringify({
                    userId: user.$id,
                    lessonId,
                    courseId
                })
            );

            const result = JSON.parse(response.responseBody);

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

            // Call video progress function with security validation
            const response = await functions.createExecution(
                FUNCTION_IDS.VIDEO_PROGRESS,
                JSON.stringify({
                    userId: user.$id,
                    lessonId,
                    watchedSeconds,
                    totalSeconds,
                    securityToken
                })
            );

            const result = JSON.parse(response.responseBody);
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

            const response = await functions.createExecution(
                FUNCTION_IDS.VIDEO_ACCESS_TOKEN,
                JSON.stringify({
                    action: 'validate',
                    userId: user.$id,
                    lessonId,
                    courseId
                })
            );

            const result = JSON.parse(response.responseBody);
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

            const response = await functions.createExecution(
                FUNCTION_IDS.VIDEO_ACCESS_TOKEN,
                JSON.stringify({
                    action: 'revoke',
                    userId: user.$id,
                    lessonId
                })
            );

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

    // YouTube video validation for instructors
    const validateYouTubeVideo = async (videoUrl) => {
        try {
            setLoading(true);

            const response = await functions.createExecution(
                FUNCTION_IDS.YOUTUBE_INTEGRATION,
                JSON.stringify({
                    action: 'validate',
                    videoUrl,
                    userId: user.$id
                })
            );

            const result = JSON.parse(response.responseBody);
            
            if (result.success) {
                return {
                    success: true,
                    videoData: {
                        videoId: result.videoId,
                        title: result.title,
                        duration: result.duration,
                        thumbnail: result.thumbnail,
                        encryptedData: result.encryptedData
                    }
                };
            } else {
                toast.error(result.error || 'Invalid YouTube video');
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Error validating YouTube video:', error);
            toast.error('Failed to validate video');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Configure video domain restrictions (Admin only)
    const configureVideoRestrictions = async (videoId, restrictions) => {
        try {
            if (!user) return { success: false, error: 'User not authenticated' };

            const response = await functions.createExecution(
                FUNCTION_IDS.YOUTUBE_INTEGRATION,
                JSON.stringify({
                    action: 'configure-restrictions',
                    videoId,
                    restrictions,
                    userId: user.$id
                })
            );

            const result = JSON.parse(response.responseBody);
            
            if (result.success) {
                toast.success('Video restrictions configured successfully');
            } else {
                toast.error(result.error || 'Failed to configure restrictions');
            }
            
            return result;
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