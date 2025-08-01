import React from "react";

function BenifitCard(props) {
  return (
    <div className="card-modern p-6 lg:p-8 flex items-center gap-6 lg:gap-8 hover-lift group">
      <div className="lg:w-24 h-full flex-shrink-0">
        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <img
            className="w-12 h-12 lg:w-14 lg:h-14 object-contain filter brightness-0 invert"
            src="https://bohubrihi.com/_next/static/media/benefit-icon-1.84ccd2d2.svg"
            alt="Benefit icon"
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:gap-4">
        <h2 className="font-banglaFontBold text-xl lg:text-2xl text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
          ইন্ডাস্ট্রি এক্সপার্টদের কন্টেন্ট
        </h2>
        <p className="text-sm lg:text-base text-gray-600 font-NotoBangla leading-6 lg:leading-8">
          আমাদের প্রতিটা কন্টেন্ট ইন্ডাস্ট্রির টপ এক্সপার্টদের সরাসরি সাপোর্ট,
          গাইডেন্স ও ফিডব্যাক দিয়ে বানানো।
        </p>
        
        {/* Feature highlights */}
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            ✓ এক্সপার্ট রিভিউড
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            ✓ আপডেটেড কন্টেন্ট
          </span>
        </div>
      </div>
    </div>
  );
}

export default BenifitCard;
