import React from "react";

function Home({className}) {
  return (
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="18px"
        y="18px"
        width="100"
        className={className}
        height="100"
        viewBox="0 0 32 32"
      >
        <path d="M 16 2.59375 L 15.28125 3.28125 L 2.28125 16.28125 L 3.71875 17.71875 L 5 16.4375 L 5 28 L 14 28 L 14 18 L 18 18 L 18 28 L 27 28 L 27 16.4375 L 28.28125 17.71875 L 29.71875 16.28125 L 16.71875 3.28125 Z M 16 5.4375 L 25 14.4375 L 25 26 L 20 26 L 20 16 L 12 16 L 12 26 L 7 26 L 7 14.4375 Z"></path>
      </svg>
    </div>
  );
}

export default Home;
