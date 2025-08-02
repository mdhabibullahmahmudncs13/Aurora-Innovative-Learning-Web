"use client"
import Link from "next/link";
import CourseCard from "../../shared/Cards/CourseCard";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";


// import required modules
import { Autoplay, FreeMode, Pagination } from "swiper/modules";

function CareerTrack() {

  const handleCardDetails = (id) => {
    window.location.href = `/courses/${id}`
  }

  const CareerCourse = [

    {
      title: "Career Skill",
      image:
        "https://bohubrihi.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fcross-border-education-technologies-pte-ltd%2Fimage%2Fupload%2Fv1707648489%2Fmftrjqxbndtwmpo2jb03.jpg&w=750&q=75",
    },
    {
      title: "Free Courses",
      image:
        "https://bohubrihi.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fcross-border-education-technologies-pte-ltd%2Fimage%2Fupload%2Fv1707648489%2Fmftrjqxbndtwmpo2jb03.jpg&w=750&q=75",
    },
    {
      title: "Product Management",
      image:
        "https://bohubrihi.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fcross-border-education-technologies-pte-ltd%2Fimage%2Fupload%2Fv1707648489%2Fmftrjqxbndtwmpo2jb03.jpg&w=750&q=75",
    },
    {
      title: "Web and App Development",
      image:
        "https://bohubrihi.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fcross-border-education-technologies-pte-ltd%2Fimage%2Fupload%2Fv1707648489%2Fmftrjqxbndtwmpo2jb03.jpg&w=750&q=75",    },
    {
      title: "Computer Science and Programming",
      image:
        "https://bohubrihi.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fcross-border-education-technologies-pte-ltd%2Fimage%2Fupload%2Fv1707648489%2Fmftrjqxbndtwmpo2jb03.jpg&w=750&q=75",    },
  ];
  return (
    <div className="px-4 lg:px-20 py-16 lg:py-24 flex flex-col gap-12">
      {/* Enhanced Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-800 mb-4">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m4 0h1" />
          </svg>
          জনপ্রিয় কোর্স সমূহ
        </div>
        <h2 className="text-4xl lg:text-6xl font-banglaFontBold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
          ক্যারিয়ার ট্র্যাক কোর্স
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto font-NotoBangla leading-relaxed">
          আপনার ক্যারিয়ারের জন্য প্রয়োজনীয় দক্ষতা অর্জন করুন আমাদের বিশেষভাবে ডিজাইন করা কোর্সগুলোর মাধ্যমে
        </p>
        <div className="mt-8">
          <Link 
            href={"/courses"} 
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl text-white font-banglaFontSemiBold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            সবগুলো দেখুন
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Enhanced Course Slider */}
      <div className="w-full relative">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-purple-50/50 rounded-3xl -z-10"></div>
        
        <Swiper
          slidesPerView={1}
          spaceBetween={20}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          freeMode={true}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 24,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
          }}
          modules={[Autoplay, FreeMode, Pagination]}
          className="mySwiper pb-12"
        >
          {CareerCourse?.map((item, index) => {
            return (
              <SwiperSlide key={index} className="h-auto">
                <div className="transform transition-all duration-300 hover:scale-105">
                  <CourseCard 
                    title={item.title} 
                    image={item.image} 
                    price={item.price} 
                    handleCardClick={()=>handleCardDetails(item._id)} 
                  />
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
        
        {/* Navigation Arrows */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10">
          <button className="swiper-button-prev-custom w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white hover:text-blue-600 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10">
          <button className="swiper-button-next-custom w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white hover:text-blue-600 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CareerTrack;
