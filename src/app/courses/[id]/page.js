import Link from "next/link";
import React from "react";

const page = async ({ params }) => {
  const { id } = await params;

  const details = {
    id: "1",
    title: "ফুল-স্ট্যাক ওয়েব ডেভেলপমেন্ট কোর্স",
    description:
      "এই কোর্সটি সম্পূর্ণভাবে নতুনদের জন্য ডিজাইন করা হয়েছে, যেখানে বেসিক থেকে অ্যাডভান্সড ওয়েব ডেভেলপমেন্ট শেখানো হবে।",
    thumbnail: "https://img.freepik.com/free-vector/vector-banner-website-development_107791-3339.jpg",
    quickLook: [
      "১০০+ ঘণ্টার রেকর্ডেড ভিডিও",
      "বেসিক থেকে অ্যাডভান্সড লেভেল",
      "লাইভ ক্লাস ও কুইজ",
      "৬ মাসের ব্যাচ / ২ বছরের কন্টেন্ট অ্যাক্সেস",
      "প্রফেশনাল সার্টিফিকেট",
    ],
    price: "৫০০০ টাকা",
    discount: "৩০% ছাড়",
  };

  return (
      <div className="grid grid-cols-10 p-3 lg:px-20 lg:py-10 gap-5">
        <div className="col-span-12 sm:col-span-6 flex flex-col gap-6">
          <h1 className="text-2xl lg:text-4xl font-banglaFontBold">
            {details?.title}
          </h1>
          <p className="text-lg font-NotoBangla text-slate-800">
            {details?.description}
          </p>
          <div className="w-full rounded-xl overflow-hidden bg-slate-500">
            <img
              className="h-full w-full object-cover"
              src={details?.thumbnail}
              alt="Thumbnail"
            />
          </div>
        </div>

        <div className="col-span-12 sm:col-span-4">
          <div className="p-6 rounded-xl border flex flex-col gap-6">
            <h3 className="font-banglaFontSemiBold text-2xl">
              এই কোর্সের ভেতরে যা যা রয়েছে
            </h3>
            <ul className="list-disc flex pl-8 flex-col gap-2">
              {details?.quickLook?.map((item) => {
                return <li key={Math.random()}>{item}</li>;
              })}
            </ul>
            <hr />

            <div className="flex items-center gap-10">
              <h4>কোর্সের মূল্য</h4>
              <span>{details?.price}</span>
              <span>{details?.discount}</span>
            </div>
            <Link href={"/courses/checkout"} className="bg-[#0a598a] py-3 px-6 rounded-md text-white font-banglaFontSemiBold">
              এখনই ভর্তি হোন
            </Link>
          </div>
        </div>
      </div>
  );
};

export default page;
