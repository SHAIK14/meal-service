import React from "react";

const OutDoorHeader = () => {
  return (
    <section>
      <div className="w-full flex flex-col justify-center items-center ">
        <div className="text-2xl font-semibold m-2">
          {" "}
          <h1>Outdoor Catering</h1>
        </div>
        <div className="flex text-md gap-2">
          <span className="font-semibold">Package Type: </span>
          <h2>Per Head</h2>
        </div>
      </div>
    </section>
  );
};

export default OutDoorHeader;
