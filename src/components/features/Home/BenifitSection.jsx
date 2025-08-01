import React from 'react';
import BenifitCard from '../../shared/Cards/BenifitCard';
import benefitsData from '@/data/content/benefits.json';

function BenifitSection(props) {
  const { benefits } = benefitsData;
  
  return (
    <div className='flex flex-col gap-10 p-3 lg:px-20 lg:py-10'>
      <h1 className='text-4xl font-banglaFontBold'>বহুব্রীহি থেকে আপনি কী কী সুবিধা পাবেন</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {benefits.map((benefit) => (
          <BenifitCard 
            key={benefit.id}
            title={benefit.title}
            description={benefit.description}
            icon={benefit.icon}
            color={benefit.color}
          />
        ))}
      </div>
    </div>
  );
}

export default BenifitSection;