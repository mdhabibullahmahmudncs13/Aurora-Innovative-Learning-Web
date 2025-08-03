// Static data exports for easy importing
import homepageData from './homepage.json';
import aboutData from './about.json';
import coursesData from './courses.json';
import contactData from './contact.json';

export {
  homepageData,
  aboutData,
  coursesData,
  contactData
};

// Default export with all data
export default {
  homepage: homepageData,
  about: aboutData,
  courses: coursesData,
  contact: contactData
};

// Helper functions to get specific data
export const getHomepageData = () => homepageData;
export const getAboutData = () => aboutData;
export const getCoursesData = () => coursesData;
export const getContactData = () => contactData;

// Get data by page name
export const getPageData = (pageName) => {
  const dataMap = {
    homepage: homepageData,
    about: aboutData,
    courses: coursesData,
    contact: contactData
  };
  
  return dataMap[pageName] || null;
};