'use client';

import { createContext, useContext, useState } from 'react';
import { databases, functions, DATABASE_IDS, COLLECTION_IDS, FUNCTION_IDS } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CourseContext = createContext({});

export const useCourse = () => {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error('useCourse must be used within a CourseProvider');
    }
    return context;
};

export const CourseProvider = ({ children }) => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch all published courses
    const fetchCourses = async (filters = {}) => {
        try {
            setLoading(true);
            const queries = [Query.equal('isPublished', true)];
            
            if (filters.category) {
                queries.push(Query.equal('category', filters.category));
            }
            if (filters.difficulty) {
                queries.push(Query.equal('difficulty', filters.difficulty));
            }
            if (filters.search) {
                queries.push(Query.search('title', filters.search));
            }
            
            const response = await databases.listDocuments(
                DATABASE_IDS.MAIN,
                COLLECTION_IDS.COURSES,
                queries
            );
            
            setCourses(response.documents);
            return { success: true, courses: response.documents };
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to fetch courses');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Fetch single course with lessons
    const fetchCourse = async (courseId) => {
        try {
            setLoading(true);
            
            // Fetch course details
            const course = await databases.getDocument(
                DATABASE_IDS.MAIN,
                COLLECTION_IDS.COURSES,
                courseId
            );
            
            // Fetch course lessons
            const lessonsResponse = await databases.listDocuments(
                DATABASE_IDS.MAIN,
                COLLECTION_IDS.LESSONS,
                [
                    Query.equal('courseId', courseId),
                    Query.orderAsc('order')
                ]
            );
            
            return {
                success: true,
                course: {
                    ...course,
                    lessons: lessonsResponse.documents
                }
            };
        } catch (error) {
            console.error('Error fetching course:', error);
            toast.error('Failed to fetch course details');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Fetch user's enrolled courses
    const fetchEnrolledCourses = async () => {
        try {
            if (!user) return { success: false, error: 'User not authenticated' };
            
            setLoading(true);
            
            const enrollmentsResponse = await databases.listDocuments(
                DATABASE_IDS.MAIN,
                COLLECTION_IDS.ENROLLMENTS,
                [Query.equal('userId', user.$id)]
            );
            
            // Fetch course details for each enrollment
            const coursesWithProgress = await Promise.all(
                enrollmentsResponse.documents.map(async (enrollment) => {
                    const course = await databases.getDocument(
                        DATABASE_IDS.MAIN,
                        COLLECTION_IDS.COURSES,
                        enrollment.courseId
                    );
                    return {
                        ...course,
                        enrollment
                    };
                })
            );
            
            setEnrolledCourses(coursesWithProgress);
            return { success: true, courses: coursesWithProgress };
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            toast.error('Failed to fetch enrolled courses');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Enroll in a course
    const enrollInCourse = async (courseId) => {
        try {
            if (!user) {
                toast.error('Please login to enroll in courses');
                return { success: false, error: 'User not authenticated' };
            }
            
            setLoading(true);
            
            // Check if already enrolled
            const existingEnrollment = await databases.listDocuments(
                DATABASE_IDS.MAIN,
                COLLECTION_IDS.ENROLLMENTS,
                [
                    Query.equal('userId', user.$id),
                    Query.equal('courseId', courseId)
                ]
            );
            
            if (existingEnrollment.documents.length > 0) {
                toast('You are already enrolled in this course');
                return { success: false, error: 'Already enrolled' };
            }
            
            // Create enrollment
            const enrollment = await databases.createDocument(
                DATABASE_IDS.MAIN,
                COLLECTION_IDS.ENROLLMENTS,
                ID.unique(),
                {
                    userId: user.$id,
                    courseId,
                    progress: 0,
                    completedLessons: [],
                    enrolledAt: new Date().toISOString()
                }
            );
            
            // Trigger enrollment handler function
            try {
                await functions.createExecution(
                    FUNCTION_IDS.ENROLLMENT_HANDLER,
                    JSON.stringify({
                        userId: user.$id,
                        courseId,
                        enrollmentId: enrollment.$id
                    })
                );
            } catch (funcError) {
                console.warn('Enrollment handler function failed:', funcError);
            }
            
            toast.success('Successfully enrolled in course!');
            return { success: true, enrollment };
        } catch (error) {
            console.error('Error enrolling in course:', error);
            toast.error('Failed to enroll in course');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Update lesson progress
    const updateLessonProgress = async (lessonId, courseId, watchedSeconds, totalSeconds) => {
        try {
            if (!user) return { success: false, error: 'User not authenticated' };
            
            // Get current enrollment
            const enrollmentResponse = await databases.listDocuments(
                DATABASE_IDS.MAIN,
                COLLECTION_IDS.ENROLLMENTS,
                [
                    Query.equal('userId', user.$id),
                    Query.equal('courseId', courseId)
                ]
            );
            
            if (enrollmentResponse.documents.length === 0) {
                return { success: false, error: 'Not enrolled in course' };
            }
            
            const enrollment = enrollmentResponse.documents[0];
            const completionThreshold = 0.8; // 80% watched = completed
            const isCompleted = (watchedSeconds / totalSeconds) >= completionThreshold;
            
            let updatedCompletedLessons = enrollment.completedLessons || [];
            
            if (isCompleted && !updatedCompletedLessons.includes(lessonId)) {
                updatedCompletedLessons.push(lessonId);
                
                // Calculate overall course progress
                const courseLessons = await databases.listDocuments(
                    DATABASE_IDS.MAIN,
                    COLLECTION_IDS.LESSONS,
                    [Query.equal('courseId', courseId)]
                );
                
                const progress = Math.round(
                    (updatedCompletedLessons.length / courseLessons.documents.length) * 100
                );
                
                // Update enrollment
                await databases.updateDocument(
                    DATABASE_IDS.MAIN,
                    COLLECTION_IDS.ENROLLMENTS,
                    enrollment.$id,
                    {
                        progress,
                        completedLessons: updatedCompletedLessons
                    }
                );
                
                if (progress === 100) {
                    toast.success('Congratulations! Course completed!');
                }
            }
            
            // Trigger video progress function
            try {
                await functions.createExecution(
                    FUNCTION_IDS.VIDEO_PROGRESS,
                    JSON.stringify({
                        userId: user.$id,
                        lessonId,
                        courseId,
                        watchedSeconds,
                        totalSeconds,
                        isCompleted
                    })
                );
            } catch (funcError) {
                console.warn('Video progress function failed:', funcError);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error updating lesson progress:', error);
            return { success: false, error: error.message };
        }
    };

    // Check if user is enrolled in a course
    const isEnrolled = async (courseId) => {
        try {
            if (!user) return false;
            
            const enrollmentResponse = await databases.listDocuments(
                DATABASE_IDS.MAIN,
                COLLECTION_IDS.ENROLLMENTS,
                [
                    Query.equal('userId', user.$id),
                    Query.equal('courseId', courseId)
                ]
            );
            
            return enrollmentResponse.documents.length > 0;
        } catch (error) {
            console.error('Error checking enrollment:', error);
            return false;
        }
    };

    const value = {
        courses,
        enrolledCourses,
        loading,
        fetchCourses,
        fetchCourse,
        fetchEnrolledCourses,
        enrollInCourse,
        updateLessonProgress,
        isEnrolled
    };

    return (
        <CourseContext.Provider value={value}>
            {children}
        </CourseContext.Provider>
    );
};