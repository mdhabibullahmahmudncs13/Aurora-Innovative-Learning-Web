import React from "react";

function ReviewCard(props) {
  return (
    <div className="grid grid-cols-1 gap-3 mb-11 md:grid-cols-2">
      <div className="flex flex-col gap-5 justify-center lg:pr-12">
        <p className="text-sm lg:text-[16px] text-start font-NotoBangla lg:leading-8 text-[#2E2F32]">
          বিগিনার লেভেলের শিক্ষার্থী হিসেবে কোনো একটা স্কিল ডেভেলপমেন্টের জন্য
          আমরা নতুন নতুন ফিচার সম্পর্কে জানার চেষ্টা করি। কিন্তু সেসব ফিচার
          আমাদের কাছে কঠিন লাগলে আমরা অনেক সময় ঘাটাঘাটি বন্ধ করে দিই। আমি মনে
          করে কঠিন ফিচারগুলো সহজভাবে বুঝার জন্য অন্যদের চেয়ে বহুব্রীহি একটা
          পার্থক্য তৈরি করেছে।
        </p>

        <div className="flex items-center gap-3 w-full">
          <div className="min-w-10 min-h-10 lg:w-12 lg:h-12 rounded-full bg-blue-600">
            <img
              className="w-full h-full object-cover"
              src="https://bohubrihi.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fbohubrihi%2Fimage%2Fupload%2Fv1682498579%2FBohubrihi%2520Website%2FThumbnail%2FStudent_Photo_2_Ashiqur_Rahman_fbsnbv.png&w=48&q=75"
              alt=""
            />
          </div>
          <div className="flex flex-col text-start w-[70%]">
            <h1 className="text-sm lg:text-2xl font-banglaFontBold">
              Shafin Talukdar Nill (শাফিন তালুকদার নীল)
            </h1>
            <p className="text-xs lg:text-sm font-NotoBangla">
              আমেরিকান ইন্টারন্যাশনাল ইউনিভার্সিটি অফ বাংলাদেশ
            </p>
          </div>
            <svg className="max-w-8 max-h-8 lg:min-w-12 lg:min-h-12" width="60" height="44" fill="none" viewBox="0 0 60 44">
              <path
                d="M0 19.166a1 1 0 0 0 1 1h12.529a.986.986 0 0 1 .99 1.025c-.417 9.588-3.35 10.716-7.001 11.046l-.58.071a1 1 0 0 0-.877.993v9.644a1 1 0 0 0 1.053.999l.626-.033c4.934-.276 10.388-1.16 14.027-5.622 3.19-3.911 4.597-10.301 4.597-20.111V1a1 1 0 0 0-1-1H1a1 1 0 0 0-1 1v18.166Z"
                fill="#0A598A"
              ></path>
              <path
                d="M34.637 0a1 1 0 0 0-1 1v18.166a1 1 0 0 0 1 1H46.97a.987.987 0 0 1 .99 1.025c-.41 9.588-3.252 10.716-6.904 11.046l-.49.065a1 1 0 0 0-.87.991v9.649a1 1 0 0 0 1.057.998l.526-.03c4.933-.275 10.437-1.158 14.076-5.62C58.546 34.377 60 27.987 60 18.177V1a1 1 0 0 0-1-1H34.637Z"
                fill="#CE268C"
              ></path>
            </svg>
        </div>
      </div>

      <div>
        <img
          className="w-full h-full object-contain rounded-lg"
          src="https://bohubrihi.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fbohubrihi%2Fimage%2Fupload%2Fv1682483839%2FBohubrihi%2520Website%2FThumbnail%2FBB-Testimonial-Video-3-Thumbnail_640x440_rptcoz.png&w=1920&q=75"
          alt=""
        />
      </div>
    </div>
  );
}

export default ReviewCard;
