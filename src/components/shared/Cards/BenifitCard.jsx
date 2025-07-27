import React from "react";

function BenifitCard(props) {
  
  return (
    <div className="border p-3 lg:p-5 rounded-md flex items-center gap-5 lg:gap-7">
      <div className="lg:w-36 h-full grid place-content-center">
        <img
          className="w-full object-contain"
          src="https://bohubrihi.com/_next/static/media/benefit-icon-1.84ccd2d2.svg"
          alt=""
        />
      </div>
      <div className="flex flex-col gap-1 lg:gap-3">
        <h2 className="font-banglaFontBold text-lg lg:text-2xl">
          ইন্ডাস্ট্রি এক্সপার্টদের কন্টেন্ট
        </h2>
        <p className="text-xs lg:text-sm text-gray-800 font-NotoBangla leading-5 lg:leading-7">
          আমাদের প্রতিটা কন্টেন্ট ইন্ডাস্ট্রির টপ এক্সপার্টদের সরাসরি সাপোর্ট,
          গাইডেন্স ও ফিডব্যাক দিয়ে বানানো।
        </p>
      </div>
    </div>
  );
}

export default BenifitCard;
