import PlayIcon from "@/components/icons/PlayIcon";
import UserIcon from "@/components/icons/UserIcon";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function CourseCard({
  // title = "ডিজিটাল মার্কেটিং",
  image = "https://bohubrihi.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fcross-border-education-technologies-pte-ltd%2Fimage%2Fupload%2Fv1707648489%2Fmftrjqxbndtwmpo2jb03.jpg&w=750&q=75",
  price = "ফ্রি কোর্স",
  handleCardClick,
  course
}) {
  const {title} = course || {};
  return (
    <div
      onClick={handleCardClick}
      className="w-full max-w-72 mb-11 self-center overflow-hidden border hover:shadow-lg rounded-md group cursor-pointer transition-all ease-in-out duration-300"
    >
      <div className="relative aspect-video">
        <Image 
          src={image} 
          alt={title || "Course thumbnail"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        <div className="absolute w-full h-full top-0 left-0 bg-gradient-to-t from-white group-hover:opacity-30 opacity-0 transition-all ease-in-out duration-300"></div>
      </div>
      <div className="p-4 flex text-start flex-col justify-between gap-4">
        <h3 className="text-2xl font-bold group-hover:text-[#ce268c] transition-all ease-in-out duration-300">
          {title}
        </h3>
        <h4 className="text-xl font-banglaFontBold text-[#029216]">
          {price === "ফ্রি কোর্স" ? price : `৳${price}`}
        </h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gray-300 w-5 h-5 rounded-full grid place-content-center">
              <PlayIcon className={"fill-gray-500 w-2 h-2 ml-[1px]"} />
            </div>
            <span className="text-xs lg:text-sm font-banglaFont text-gray-500">
              ১৮ লেসন
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gray-300 w-5 h-5 rounded-full grid place-content-center">
              <UserIcon className={"fill-slate-500 w-[10px] h-[10px]"} />
            </div>
            <span className="text-xs lg:text-sm font-banglaFont text-gray-500">
              ৭৪১২ শিক্ষার্থী
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
