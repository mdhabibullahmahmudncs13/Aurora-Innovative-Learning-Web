import React from "react";

function PracticalProjectSection(props) {
  return (
    <div className="flex flex-col p-3 lg:p-20 gap-20">
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 lg:gap-10">
        <div className="md:col-span-5 flex flex-col justify-center gap-6">
          <h2 className="text-2xl lg:text-4xl lg:leading-[50px] lg:w-[90%] font-banglaFontBold">
            রিয়েল লাইফ প্রজেক্টের <br /> মাধ্যমে মার্কেট স্ট্যান্ডার্ড কাজ শিখুন
          </h2>
          <p className="text-sm lg:text-lg leading-8 text-gray-800 font-NotoBangla">
            একেবারে বেসিক থেকে অ্যাডভান্সড লেভেল পর্যন্ত সবকিছু আপনি ধাপে ধাপে
            শিখবেন আমাদের ক্যারিয়ার ট্র্যাকগুলোতে। এর জন্য করবেন রিয়েল লাইফ
            প্রজেক্ট, যা জব ও ফ্রিল্যান্সিং মার্কেটে কাজ করার কনফিডেন্স এনে দেবে
            আপনাকে।
          </p>
        </div>
        <div className="md:col-span-6">
          <img
            className="rounded-md w-full"
            src="https://bohubrihi.com/_next/static/media/practical-project.ead19e3b.svg"
            alt=""
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <div className="flex flex-col hover:shadow-md transition-all ease-in-out duration-150 cursor-pointer items-center justify-center gap-1 rounded-md border p-4">
          <h3 className="text-[#59A0A2] text-xl lg:text-4xl font-banglaFontBold">৩৬৯,০৮৬</h3>
          <h2 className="text-[#2E2F32] text-xs text-nowrap lg:text-[16px] font-NotoBangla">সর্বমোট এনরোলমেন্ট</h2>
        </div>

        <div className="flex flex-col hover:shadow-md transition-all ease-in-out duration-150 cursor-pointer items-center justify-center gap-1 rounded-md border p-4">
          <h3 className="text-[#D39026] text-xl lg:text-4xl font-banglaFontBold">২৬৯,৯৩৬</h3>
          <h2 className="text-[#2E2F32] text-xs text-nowrap lg:text-[16px] font-NotoBangla">স্টুডেন্টের সংখ্যা</h2>
        </div>

        <div className="flex flex-col hover:shadow-md transition-all ease-in-out duration-150 cursor-pointer items-center justify-center gap-1 rounded-md border p-4">
          <h3 className="text-[#B263C4] text-xl lg:text-4xl font-banglaFontBold">১১,৩৩২</h3>
          <h2 className="text-[#2E2F32] text-xs text-nowrap lg:text-[16px] font-NotoBangla">সর্বমোট ভিডিও</h2>
        </div>

        <div className="flex flex-col hover:shadow-md transition-all ease-in-out duration-150 cursor-pointer items-center justify-center gap-1 rounded-md border p-4">
          <h3 className="text-[#D65956] text-xl lg:text-4xl font-banglaFontBold">৫৫</h3>
          <h2 className="text-[#2E2F32] text-xs text-nowrap lg:text-[16px] font-NotoBangla">কোর্স ও ক্যারিয়ার ট্র্যাক</h2>
        </div>
        
      </div>
    </div>
  );
}

export default PracticalProjectSection;
