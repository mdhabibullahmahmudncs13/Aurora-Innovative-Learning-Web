"use client";

import { useState, useEffect } from "react";
import Filter from "@/components/Filter";
import CourseCard from "@/components/shared/Cards/CourseCard";

const COURSES_PER_PAGE = 6; // Courses per page

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch courses (replace this with an API call if needed)
  useEffect(() => {
    async function fetchCourses() {
      const res = await fetch("/api/courses"); // Use API route
      const data = await res.json();
      setCourses(data);
    }
    fetchCourses();
  }, []);

  const handleCardClick = (id) => {
    console.log(id)
    window.location.href = `/courses/${id}`
  }


  // Filter courses based on selected categories
  const filteredCourses =
    selectedCategories.length > 0
      ? courses.filter((course) => selectedCategories.includes(course.category))
      : courses;

  // Pagination Logic
  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE
  );

  return (
    <div className="flex flex-col p-3 md:p-10 gap-3 md:gap-10">
      {/* Hero Section */}
      <div className="bg-[url('https://bohubrihi.com/images/banners/courses_banner.png')] w-full min-h-[30vh] bg-no-repeat bg-cover md:min-h-[40vh] lg:min-h-[50vh] rounded-lg flex flex-col items-center justify-center text-white bg-center p-3 gap-2 md:gap-5">
        <h3 className="text-2xl md:text-4xl font-banglaFontBold">
          বাংলা অনলাইন কোর্স
        </h3>
        <p className="text-center text-sm text-gray-200 md:text-lg font-NotoBangla">
          আপনার পছন্দের কোর্সটি বেছে নিন আর দক্ষতা অর্জন করে হয়ে উঠুন
          স্বাবলম্বী।
        </p>
      </div>

      {/* Content with Sidebar Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:p-10 gap-5">
        <Filter
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
        />
        
        <div className="gap-3 md:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {paginatedCourses.length > 0 ? (
            paginatedCourses.map((course) => (
              <CourseCard key={course.id} handleCardClick={()=>handleCardClick(course.id)} course={course} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No courses found.
            </p>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-5">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 mx-1 ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
