'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { account, databases, DATABASE_IDS, COLLECTION_IDS } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const session = await account.get();
            if (session) {
                setUser(session);
                await fetchUserProfile(session.$id);
            }
        } catch (error) {
            console.log('No active session');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProfile = async (userId) => {
        try {
            const profile = await databases.getDocument(
                DATABASE_IDS.MAIN,
                COLLECTION_IDS.USERS,
                userId
            );
            setUserProfile(profile);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const login = async (email, password) => {
        try {
            console.log('AuthContext - Starting login process for:', email);
            setLoading(true);
            
            // Check if there's already an active session and logout first
            try {
                await account.get();
                // If we get here, there's an active session, so logout first
                console.log('AuthContext - Deleting existing session');
                await account.deleteSession('current');
            } catch (error) {
                console.log('AuthContext - No existing session to delete');
            }
            
            console.log('AuthContext - Creating new session...');
            const session = await account.createEmailPasswordSession(email, password);
            console.log('AuthContext - Session created:', session.$id);
            
            console.log('AuthContext - Fetching user data...');
            const user = await account.get();
            console.log('AuthContext - User data fetched:', user.email);
            setUser(user);
            
            console.log('AuthContext - Fetching user profile...');
            await fetchUserProfile(user.$id);
            
            // Wait a moment to ensure all state updates are complete
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('AuthContext - Login process completed successfully');
            
            toast.success('Successfully logged in!');
            return { success: true, user };
        } catch (error) {
            console.error('AuthContext - Login error:', error);
            toast.error(error.message || 'Login failed');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (email, password, name) => {
        try {
            setLoading(true);
            console.log('AuthContext - Starting registration process for:', email);
            
            // Create account
            console.log('AuthContext - Creating Appwrite account...');
            const newUser = await account.create(ID.unique(), email, password, name);
            console.log('AuthContext - Account created successfully:', newUser.$id);
            
            // Create user profile in database
            console.log('AuthContext - Creating user profile in database...');
            console.log('AuthContext - Database ID:', DATABASE_IDS.MAIN);
            console.log('AuthContext - Collection ID:', COLLECTION_IDS.USERS);
            
            try {
                const userProfile = await databases.createDocument(
                    DATABASE_IDS.MAIN,
                    COLLECTION_IDS.USERS,
                    newUser.$id,
                    {
                        email,
                        name,
                        role: 'regular',
                        avatar: null,
                        bio: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                );
                console.log('AuthContext - User profile created successfully:', userProfile.$id);
            } catch (dbError) {
                console.error('AuthContext - Error creating user profile in database:', dbError);
                console.error('AuthContext - Database error details:', {
                    code: dbError.code,
                    type: dbError.type,
                    message: dbError.message
                });
                
                // Still continue with login even if profile creation fails
                toast.error('Account created but profile setup failed. Please contact support.');
            }
            
            // Create session directly instead of calling login
            console.log('AuthContext - Creating session...');
            const session = await account.createEmailPasswordSession(email, password);
            console.log('AuthContext - Session created:', session.$id);
            
            const userAccount = await account.get();
            console.log('AuthContext - User account retrieved:', userAccount.email);
            setUser(userAccount);
            
            // Try to fetch user profile, but don't fail if it doesn't exist
            try {
                await fetchUserProfile(userAccount.$id);
                console.log('AuthContext - User profile fetched successfully');
            } catch (profileError) {
                console.warn('AuthContext - Could not fetch user profile:', profileError);
                // Set a basic profile if database profile doesn't exist
                setUserProfile({
                    $id: userAccount.$id,
                    email: userAccount.email,
                    name: userAccount.name,
                    role: 'regular'
                });
            }
            
            toast.success('Account created successfully!');
            return { success: true, user: userAccount };
        } catch (error) {
            console.error('AuthContext - Registration error:', error);
            console.error('AuthContext - Error details:', {
                code: error.code,
                type: error.type,
                message: error.message
            });
            
            // Handle specific session error
            if (error.message && error.message.includes('session is active')) {
                // If session already exists, just get current user
                try {
                    const currentUser = await account.get();
                    setUser(currentUser);
                    await fetchUserProfile(currentUser.$id);
                    toast.success('Account created and logged in successfully!');
                    return { success: true, user: currentUser };
                } catch (getError) {
                    console.error('Error getting current user:', getError);
                }
            }
            
            toast.error(error.message || 'Registration failed');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
            setUserProfile(null);
            toast.success('Successfully logged out!');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout failed');
            return { success: false, error: error.message };
        }
    };

    // Debug function to test user profile creation
    const testCreateUserProfile = async (testUser = null) => {
        try {
            const currentUser = testUser || user;
            if (!currentUser) {
                throw new Error('No user available for testing');
            }

            console.log('🧪 Testing user profile creation for:', currentUser.email);
            
            const profileData = {
                userId: currentUser.$id,
                email: currentUser.email,
                name: currentUser.name,
                role: 'regular',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('🧪 Profile data to create:', profileData);

            const profile = await databases.createDocument(
                DATABASE_IDS.MAIN,
                COLLECTION_IDS.USERS,
                currentUser.$id,
                profileData
            );

            console.log('🧪 ✅ Test profile created successfully:', profile);
            
            // Update local state if this is for the current user
            if (!testUser) {
                setUserProfile(profile);
            }
            
            return { success: true, profile };
        } catch (error) {
            console.error('🧪 ❌ Test profile creation failed:', error);
            return { success: false, error: error.message };
        }
    };

    const updateProfile = async (data) => {
        try {
            if (!user) throw new Error('No user logged in');
            
            const updatedProfile = await databases.updateDocument(
                DATABASE_IDS.MAIN,
                COLLECTION_IDS.USERS,
                user.$id,
                {
                    ...data,
                    updatedAt: new Date().toISOString()
                }
            );
            
            setUserProfile(updatedProfile);
            toast.success('Profile updated successfully!');
            return { success: true, profile: updatedProfile };
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.message || 'Profile update failed');
            return { success: false, error: error.message };
        }
    };

    const changePassword = async (oldPassword, newPassword) => {
        try {
            await account.updatePassword(newPassword, oldPassword);
            toast.success('Password changed successfully!');
            return { success: true };
        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error.message || 'Password change failed');
            return { success: false, error: error.message };
        }
    };

    const resetPassword = async (email) => {
        try {
            await account.createRecovery(
                email,
                `${window.location.origin}/auth/reset-password`
            );
            toast.success('Password reset email sent!');
            return { success: true };
        } catch (error) {
            console.error('Password reset error:', error);
            toast.error(error.message || 'Password reset failed');
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        userProfile,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        resetPassword,
        checkAuth,
        testCreateUserProfile,
        isAuthenticated: !!user,
        isAdmin: userProfile?.role === 'admin',
        isInstructor: userProfile?.role === 'instructor' || userProfile?.role === 'admin',
        isRegular: userProfile?.role === 'regular'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};