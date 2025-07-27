import React from "react";

function SkillCard({ image, name }) {
  return (
    <div className="h-[330px] w-full mb-11 max-w-[310px] border hover:shadow-md transition-all ease-in-out duration-100 rounded-md flex flex-col items-center justify-center gap-10">
      <div className="w-32 h-32 p-1">
        <img className="w-full h-full object-contain" src={image} />
      </div>
      <h2 className="text-xl font-bold">{name}</h2>
    </div>
  );
}

export default SkillCard;
