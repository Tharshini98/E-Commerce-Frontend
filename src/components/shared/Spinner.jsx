import React from "react";

const Spinner = ({ size = "md" }) => {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className="flex justify-center items-center py-8">
      <div className={`${sizes[size]} border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin`} />
    </div>
  );
};

export default Spinner;
