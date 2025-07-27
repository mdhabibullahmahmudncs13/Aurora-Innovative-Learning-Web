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
    <div className="p-3 lg:px-20 lg:py-10 flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl text-nowrap lg:text-4xl font-banglaFontBold">ক্যারিয়ার ট্র্যাক কোর্স</h2>
        <Link href={"/courses"} className="py-2 px-2 text-nowrap lg:px-6 rounded-sm text-white bg-blue-800 font-banglaFontSemiBold text-sm lg:text-lg">সবগুলো দেখুন</Link>
      </div>

      <div className="w-full relative">
        {/* Slider Start */}

        <Swiper
          slidesPerView={1}
          spaceBetween={10}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          freeMode={true}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 10,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 10,
            },
          }}
          modules={[Autoplay, FreeMode, Pagination]}
          className="mySwiper"
        >
          {CareerCourse?.map((item) => {
            return (
              <SwiperSlide key={Math.random()}>
                <CourseCard title={item.title} image={item.image} price={item.price} handleCardClick={()=>handleCardDetails(item._id)} />
              </SwiperSlide>
            );
          })}

        </Swiper>
      </div>
    </div>
  );
}

export default CareerTrack;
