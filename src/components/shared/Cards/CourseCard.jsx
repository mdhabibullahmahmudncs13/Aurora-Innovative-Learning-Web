import PlayIcon from "@/components/icons/PlayIcon";
import UserIcon from "@/components/icons/UserIcon";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function CourseCard({
  image = "https://bohubrihi.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fcross-border-education-technologies-pte-ltd%2Fimage%2Fupload%2Fv1707648489%2Fmftrjqxbndtwmpo2jb03.jpg&w=750&q=75",
  price = "ফ্রি কোর্স",
  handleCardClick,
  course
}) {
  const { title } = course || {};
  
  return (
    <div
      onClick={handleCardClick}
      className="w-full max-w-sm mb-8 self-center overflow-hidden card-modern hover-lift hover-glow cursor-pointer group"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image 
          src={image} 
          alt={title || "Course thumbnail"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
            <PlayIcon className="fill-blue-600 w-6 h-6 ml-1" />
          </div>
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            price === "ফ্রি কোর্স" 
              ? "bg-green-500 text-white" 
              : "bg-gradient-accent text-white"
          } shadow-lg`}>
            {price === "ফ্রি কোর্স" ? price : `৳${price}`}
          </span>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <PlayIcon className="fill-white w-3 h-3 ml-[1px]" />
            </div>
            <span className="font-medium font-banglaFont">
              ১৮ লেসন
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center shadow-md">
              <UserIcon className="fill-white w-3 h-3" />
            </div>
            <span className="font-medium font-banglaFont">
              ৭৪১২ শিক্ষার্থী
            </span>
          </div>
        </div>
        
        {/* Progress Bar (if applicable) */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-gradient-primary h-2 rounded-full transition-all duration-500" style={{width: '0%'}}></div>
        </div>
        
        {/* Action Button */}
        <button className="w-full py-3 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover-lift">
          কোর্স দেখুন
        </button>
      </div>
    </div>
  );
}

export default CourseCard;
