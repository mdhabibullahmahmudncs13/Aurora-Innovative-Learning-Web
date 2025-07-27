"use client";
import React, { useState } from "react";
import DownArrow from "@/components/icons/DownArrow";

function ContactSection(props) {
  const [isOpen, setIsOpen] = useState(null);

  const handleDropDown = (index) => {
    index === isOpen ? setIsOpen(null) : setIsOpen(index);
  };
  const DropDownInfo = [
    {
      title: "কোর্স নির্বাচন করুন *",
      options: [
        { title: "ডিজিটাল মার্কেটিং 1" },
        { title: "ডিজিটাল মার্কেটিং 2" },
        { title: "ডিজিটাল মার্কেটিং 3" },
        { title: "ডিজিটাল মার্কেটিং 4" },
      ],
    },
    {
      title: "কোর্স নির্বাচন করুন 2*",
      options: [
        { title: "ডিজিটাল মার্কেটিং 2" },
        { title: "ডিজিটাল মার্কেটিং 2" },
        { title: "ডিজিটাল মার্কেটিং 3" },
        { title: "ডিজিটাল মার্কেটিং 4" },
      ],
    },
    {
      title: "কোর্স নির্বাচন করুন 3*",
      options: [
        { title: "ডিজিটাল মার্কেটিং 2" },
        { title: "ডিজিটাল মার্কেটিং 2" },
        { title: "ডিজিটাল মার্কেটিং 3" },
        { title: "ডিজিটাল মার্কেটিং 4" },
      ],
    },
  ];

  return (
    <div className="lg:px-20 lg:py-10">
      <div className="bg-[url('https://bohubrihi.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcall-book-bg.67ca723f.jpg&w=640&q=75')] flex flex-col-reverse md:flex-row md:rounded-lg gap-5 p-3 md:gap-16 md:p-16">
        <form className="bg-white flex flex-col gap-4 rounded-lg p-4 w-full md:w-1/2">
          <h2 className="text-2xl mb-5 font-banglaFontBold">কল বুক করুন</h2>

          <input
            type="text"
            placeholder="আপনার নাম *"
            className="w-full rounded-sm border hover:border-black transition-all ease-in-out duration-200 outline-none py-3 px-4 bg-gray-200"
          />
          <input
            type="text"
            placeholder="ফোন নাম্বার *"
            className="w-full rounded-sm border hover:border-black transition-all ease-in-out duration-200 outline-none py-3 px-4 bg-gray-200"
          />

          {DropDownInfo?.map((info, index) => {
            return (
              <div
              key={Math.random()}
                onClick={() => handleDropDown(index)}
                className="w-full flex items-center justify-between rounded-sm border hover:border-black transition-all ease-in-out duration-200 outline-none py-3 px-4 bg-gray-200 relative"
              >
                <span className="font-NotoBangla text-[16px]">
                  {info.title}
                </span>
                <DownArrow className={"fill-gray-400 stroke-gray-400"} />

                <div
                  className={`${
                    isOpen === index ? "flex" : "hidden"
                  } w-full flex-col max-h-80 z-20 rounded-sm bg-white border border-black absolute left-0 top-[calc(100%+5px)]`}
                >
                  {info.options?.map((options) => {
                    return (
                      <span key={Math.random()} className="p-4 text-black font-NotoBangla hover:bg-[#0C4A6E] hover:text-white transition-all ease-in-out duration-200">
                        {options.title}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button className="w-full rounded-sm border hover:border-black transition-all ease-in-out duration-200 outline-none py-3 px-4 text-white font-banglaFontSemiBold text-[16px] bg-[#0C4A6E] mt-5">
            কল বুক করুন
          </button>
        </form>

        <div className="flex flex-col gap-3 md:gap-5 justify-center w-full md:w-1/2">
          <h2 className="text-2xl lg:text-4xl font-banglaFontBold text-white lg:leading-[45px]">
            ফ্রি কলে পরামর্শ নিন <br /> ক্যারিয়ার কাউন্সিলরের কাছ থেকে
          </h2>
          <p className="text-sm lg:text-lg text-gray-200 lg:leading-8 font-NotoBangla">
            আপনি যেন সঠিক ক্যারিয়ার সিদ্ধান্ত নিতে পারেন, তার জন্য আমরা দিচ্ছি
            ফ্রি ক্যারিয়ার কাউন্সেলিং সাপোর্ট। ক্যারিয়ার নিয়ে আপনার বিভিন্ন
            প্রশ্নের উত্তর পাবেন অভিজ্ঞ ক্যারিয়ার কাউন্সেলরদের কাছ থেকে।
          </p>
        </div>
      </div>
    </div>
  );
}

export default ContactSection;
