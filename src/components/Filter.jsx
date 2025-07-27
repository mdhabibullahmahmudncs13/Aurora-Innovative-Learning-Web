"use client";

import React from "react";

const categories = ["Career Skills", "Free Courses", "Product Management", "Web Development"];

function Filter({ selectedCategories, setSelectedCategories }) {
  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  return (
    <div className="w-full rounded-md border p-5">
      <h4 className="text-lg font-banglaFontBold mb-3">ক্যাটাগরি</h4>
      <div className="flex flex-col justify-start gap-3">
        {categories.map((category) => (
          <div key={category} className="flex items-center gap-3">
            <input
              type="checkbox"
              id={category}
              className="w-6 h-6"
              checked={selectedCategories.includes(category)}
              onChange={() => handleCategoryChange(category)}
            />
            <label htmlFor={category} className="text-sm font-NotoBangla">
              {category}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Filter;
