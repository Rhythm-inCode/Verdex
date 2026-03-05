import React from "react";

export default function PageContainer({ children }) {
  return (
    <div className="w-full">
      <div
        className="
          w-full
          px-4 sm:px-6 md:px-10 xl:px-20
          py-12 sm:py-16 lg:py-8
          xl:max-w-[1400px]
          xl:mx-auto
        "
      >
        {children}
      </div>
    </div>
  );
}