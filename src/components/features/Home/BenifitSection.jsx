import React from 'react';
import BenifitCard from '../../shared/Cards/BenifitCard';
import benefitsData from '@/data/content/benefits.json';

function BenifitSection(props) {
  const { benefits } = benefitsData;
  
  return (
    <div className='relative px-4 lg:px-20 py-16 lg:py-24 overflow-hidden'>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100/30 to-blue-100/30 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className='relative z-10 flex flex-col gap-16'>
        {/* Enhanced Header Section */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-800 mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            আমাদের বিশেষত্ব
          </div>
          <h1 className='text-4xl lg:text-6xl font-banglaFontBold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6 leading-tight'>
            বহুব্রীহি থেকে আপনি কী কী সুবিধা পাবেন
          </h1>
          <p className="text-lg text-gray-600 font-NotoBangla leading-relaxed">
            আমাদের প্ল্যাটফর্মে রয়েছে অসংখ্য সুবিধা যা আপনার শেখার অভিজ্ঞতাকে করবে আরও সমৃদ্ধ ও কার্যকর
          </p>
        </div>
        
        {/* Enhanced Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {benefits.map((benefit, index) => (
            <div 
              key={benefit.id}
              className="group transform transition-all duration-500 hover:scale-105"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <BenifitCard 
                title={benefit.title}
                description={benefit.description}
                icon={benefit.icon}
                color={benefit.color}
              />
            </div>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-banglaFontSemiBold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            আজই শুরু করুন আপনার যাত্রা
          </div>
        </div>
      </div>
    </div>
  );
}

export default BenifitSection;