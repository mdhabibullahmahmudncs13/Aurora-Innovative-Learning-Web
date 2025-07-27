"use client"
import Link from "next/link";
import React from "react";

function Footer(props) {


  return (
    <div className={`w-full bg-slate-950 text-white grid grid-cols-1 lg:grid-cols-2 p-3 lg:p-20 gap-10 lg:gap-3`}>
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-banglaFontBold">বহুব্রীহি সম্পর্কিত</h2>
        <p className="font-NotoBangla text-[#CCCCD0] font-thin leading-8 text-sm lg:text-lg lg:w-[60%]">
          যেকোনো বয়সের শিক্ষার্থী, প্রফেশনাল ও ফ্রিল্যান্সারদের জন্য বহুব্রীহি
          হলো দেশের সেরা স্কিল ডেভেলপমেন্ট সলিউশন। বহুব্রীহিতে ইন্ডাস্ট্রির
          এক্সপার্টদের বানানো ক্যারিয়ার ট্র্যাক প্রোগ্রাম ও ফাউন্ডেশন কোর্সগুলো
          দেশে-বিদেশে আপনার সফল ক্যারিয়ার নিশ্চিত করবে।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6">
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-banglaFontBold">নেভিগেশন</h2>
          <div className="flex flex-col gap-3">
            <Link
              href={"/"}
              className="text-[#CCCCD0] font-NotoBangla hover:text-[#ce268c] transition-all ease-in-out duration-300"
            >
              সকল কোর্স
            </Link>
            <Link
              href={"/"}
              className="text-[#CCCCD0] font-NotoBangla hover:text-[#ce268c] transition-all ease-in-out duration-300"
            >
              ব্লগ
            </Link>
            <Link
              href={"/"}
              className="text-[#CCCCD0] font-NotoBangla hover:text-[#ce268c] transition-all ease-in-out duration-300"
            >
              টার্মস এন্ড কন্ডিশন
            </Link>
            <Link
              href={"/"}
              className="text-[#CCCCD0] font-NotoBangla hover:text-[#ce268c] transition-all ease-in-out duration-300"
            >
              রিফান্ড পলিসি
            </Link>
            <Link
              href={"/"}
              className="text-[#CCCCD0] font-NotoBangla hover:text-[#ce268c] transition-all ease-in-out duration-300"
            >
              প্রাইভেসি পলিসি
            </Link>
            <Link
              href={"/"}
              className="text-[#CCCCD0] font-NotoBangla hover:text-[#ce268c] transition-all ease-in-out duration-300"
            >
              প্লেসমেন্ট সাপোর্ট
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-banglaFontBold">সাপোর্ট সেন্টার</h2>
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-banglaFontBold">16222</h2>
            <h3 className="text-2xl">{"(9 AM - 10 PM)"}</h3>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-banglaFont">Email</h2>
            <h3 className="text-3xl font-bold">{"info@bohubrihi.com"}</h3>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-banglaFontBold">সোশাল লিঙ্ক</h2>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
