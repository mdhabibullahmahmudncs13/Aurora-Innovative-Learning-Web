import React from "react";

function PracticalProjectSection(props) {
  return (
    <div className="relative px-4 lg:px-20 py-16 lg:py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50"></div>
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-gradient-to-tr from-purple-100/20 to-blue-100/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col gap-20">
        {/* Enhanced Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col justify-center gap-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-800 mb-4 w-fit">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              প্র্যাক্টিক্যাল লার্নিং
            </div>
            <h2 className="text-3xl lg:text-5xl lg:leading-[60px] font-banglaFontBold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              রিয়েল লাইফ প্রজেক্টের <br /> মাধ্যমে মার্কেট স্ট্যান্ডার্ড কাজ শিখুন
            </h2>
            <p className="text-lg leading-8 text-gray-700 font-NotoBangla">
              একেবারে বেসিক থেকে অ্যাডভান্সড লেভেল পর্যন্ত সবকিছু আপনি ধাপে ধাপে
              শিখবেন আমাদের ক্যারিয়ার ট্র্যাকগুলোতে। এর জন্য করবেন রিয়েল লাইফ
              প্রজেক্ট, যা জব ও ফ্রিল্যান্সিং মার্কেটে কাজ করার কনফিডেন্স এনে দেবে
              আপনাকে।
            </p>
            
            {/* Feature List */}
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700 font-NotoBangla">ইন্ডাস্ট্রি স্ট্যান্ডার্ড প্রজেক্ট</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700 font-NotoBangla">হ্যান্ডস-অন লার্নিং এক্সপেরিয়েন্স</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700 font-NotoBangla">পোর্টফোলিও তৈরির সুযোগ</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-50"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full opacity-50"></div>
            
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-300">
              <img
                className="rounded-2xl w-full"
                src="https://bohubrihi.com/_next/static/media/practical-project.ead19e3b.svg"
                alt="Practical Project Learning"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-6 lg:p-8 border border-gray-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-t-2xl"></div>
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-teal-600 text-2xl lg:text-4xl font-banglaFontBold group-hover:scale-110 transition-transform duration-300">৩৬৯,০৮৬</h3>
              <h2 className="text-gray-700 text-sm lg:text-base font-NotoBangla text-center leading-tight">সর্বমোট এনরোলমেন্ট</h2>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-6 lg:p-8 border border-gray-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-t-2xl"></div>
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-amber-600 text-2xl lg:text-4xl font-banglaFontBold group-hover:scale-110 transition-transform duration-300">২৬৯,৯৩৬</h3>
              <h2 className="text-gray-700 text-sm lg:text-base font-NotoBangla text-center leading-tight">স্টুডেন্টের সংখ্যা</h2>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-6 lg:p-8 border border-gray-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-t-2xl"></div>
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-purple-600 text-2xl lg:text-4xl font-banglaFontBold group-hover:scale-110 transition-transform duration-300">১১,৩৩২</h3>
              <h2 className="text-gray-700 text-sm lg:text-base font-NotoBangla text-center leading-tight">সর্বমোট ভিডিও</h2>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-6 lg:p-8 border border-gray-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-pink-500 rounded-t-2xl"></div>
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-red-600 text-2xl lg:text-4xl font-banglaFontBold group-hover:scale-110 transition-transform duration-300">৫৫</h3>
              <h2 className="text-gray-700 text-sm lg:text-base font-NotoBangla text-center leading-tight">কোর্স ও ক্যারিয়ার ট্র্যাক</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PracticalProjectSection;
