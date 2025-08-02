import Link from "next/link";
import React from "react";

function HeroSection(props) {
  return (
    <div className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-purple-600/20"></div>
      
      {/* Animated Background Shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative container mx-auto grid grid-cols-1 lg:grid-cols-2 place-items-center font-banglaFontBold px-4 lg:px-20 py-16 lg:py-24 min-h-screen">
        <div className="flex flex-col items-center lg:items-start gap-6 lg:gap-8 text-white z-10">
          {/* Enhanced Heading */}
          <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-blue-100 border border-white/20">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              অনলাইন শিক্ষার নতুন যুগ
            </div>
            <h1 className="text-5xl lg:text-7xl leading-tight lg:leading-[80px] bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent font-extrabold">
              নিজের মত শিখুন,<br />আত্মবিশ্বাস গড়ুন!
            </h1>
          </div>
          
          <p className="text-center text-lg leading-8 lg:leading-[36px] lg:text-start lg:text-xl font-NotoBangla text-blue-100 max-w-2xl">
            চাকরি কিংবা ফ্রিল্যান্সিংয়ের জন্য নিজেকে প্রস্তুত করতে বহুব্রীহির
            ক্যারিয়ার ট্র্যাক কোর্সগুলোই যথেষ্ট।
          </p>
          
          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link
              href={"/courses"}
              className="group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-2xl py-4 px-8 lg:text-xl lg:px-10 text-white text-center font-banglaFontSemiBold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg border border-pink-400/50"
            >
              <div className="flex items-center justify-center">
                কোর্সগুলো দেখুন
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
            
            <Link
              href={"/about"}
              className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl py-4 px-8 lg:text-xl lg:px-10 text-white text-center font-banglaFontSemiBold transition-all duration-300 border border-white/30 hover:border-white/50"
            >
              <div className="flex items-center justify-center">
                আরও জানুন
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
          
          {/* Stats Section */}
          <div className="flex flex-wrap gap-8 mt-8 text-center lg:text-left">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">১০,০০০+</span>
              <span className="text-blue-200 text-sm">সফল শিক্ষার্থী</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">৫০+</span>
              <span className="text-blue-200 text-sm">কোর্স</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">৯৮%</span>
              <span className="text-blue-200 text-sm">সন্তুষ্ট শিক্ষার্থী</span>
            </div>
          </div>
        </div>

        {/* Enhanced Image Section */}
        <div className="mt-10 lg:mt-0 relative z-10">
          <div className="relative">
            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-full h-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-xl"></div>
            <div className="absolute -bottom-4 -right-4 w-full h-full bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-3xl blur-xl"></div>
            
            {/* Main Image Container */}
            <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-2xl">
              <img 
                className="w-full h-full rounded-2xl shadow-lg" 
                src="https://bohubrihi.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fcross-border-education-technologies-pte-ltd%2Fimage%2Fupload%2Fv1681187020%2FBohubrihi%2Fhero2x_st3vd8.png&w=1920&q=75" 
                alt="Online Learning Platform" 
              />
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-4 shadow-lg animate-bounce">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl p-4 shadow-lg animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
