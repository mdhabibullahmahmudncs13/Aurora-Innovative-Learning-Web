import Link from "next/link";
import React from "react";

function HeroSection(props) {

  return (
    <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 place-items-center font-banglaFontBold p-3 lg:px-20 mt-8 lg:py-16">
      <div className="flex flex-col items-center lg:items-start gap-4 lg:gap-7">
        <h1 className="text-4xl lg:text-6xl leading-[48px] lg:leading-[72px]">
          নিজের মত শিখুন,<br></br>আত্মবিশ্বাস গড়ুন!
        </h1>
        <p className="text-center text-sm leading-7 lg:leading-[32px] lg:text-start lg:text-lg font-NotoBangla">
          চাকরি কিংবা ফ্রিল্যান্সিংয়ের জন্য নিজেকে প্রস্তুত করতে বহুব্রীহির
          ক্যারিয়ার ট্র্যাক কোর্সগুলোই যথেষ্ট।
        </p>
        <Link
          href={"/courses"}
          className="bg-[#ce268c] rounded-sm py-2 px-3 lg:text-lg lg:px-5 text-white text-center font-banglaFontSemiBold"
        >
          কোর্সগুলো দেখুন
        </Link>
      </div>

      <div className="mt-5 lg:mt-0">
        <img className="w-full h-full" src="https://bohubrihi.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fcross-border-education-technologies-pte-ltd%2Fimage%2Fupload%2Fv1681187020%2FBohubrihi%2Fhero2x_st3vd8.png&w=1920&q=75" alt="" />
      </div>
    </div>
  );
}

export default HeroSection;
