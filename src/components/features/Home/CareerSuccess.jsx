import React from "react";

function CareerSuccess(props) {
  return (
    <div className="p-3 lg:px-20 lg:py-10 bg-gray-200">
      <div className="w-full rounded-md md:bg-white md:p-20">
        <div className="flex flex-col md:px-20 items-center justify-center text-center gap-3 md:gap-8">
          <h1 className="text-2xl md:text-4xl font-banglaFontBold">
            সফল ক্যারিয়ার গড়তে সঠিক প্রোগ্রামটি বেছে নিন
          </h1>
          <p className="font-NotoBangla md:text-lg md:leading-8">
            সফল ক্যারিয়ার গড়তে দরকার সঠিক জায়গায় নিজের সময় আর পরিশ্রম দেয়া। তাই
            বহুব্রীহি থেকেই অর্জন করুন জব-রেডি হবার কনফিডেন্স আর স্কিল।
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-3 md:gap-6 md:flex-row">
            <button className="py-3 bg-[#ce268c] font-banglaFontBold text-lg rounded-md text-white">
              সবগুলো কোর্স দেখুন
            </button>
            <button className="py-3 bg-[#20252d] font-banglaFontBold text-lg rounded-md text-white">
              কল বুক করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareerSuccess;
