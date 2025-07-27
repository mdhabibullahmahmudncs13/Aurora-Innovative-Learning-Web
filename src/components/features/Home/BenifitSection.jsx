import React from 'react';
import BenifitCard from '../../shared/Cards/BenifitCard';

function BenifitSection(props) {
  return (
    <div className='flex flex-col gap-10 p-3 lg:px-20 lg:py-10'>
      <h1 className='text-4xl font-banglaFontBold'>বহুব্রীহি থেকে আপনি কী কী সুবিধা পাবেন</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BenifitCard/>
        <BenifitCard/>
        <BenifitCard/>
        <BenifitCard/>
        <BenifitCard/>
        <BenifitCard/>
      </div>
    </div>
  );
}

export default BenifitSection;