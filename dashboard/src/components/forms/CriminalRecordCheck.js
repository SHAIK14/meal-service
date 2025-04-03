import React, { useState } from "react";

const CriminalRecordCheck = () => {
  const [hasRecord, setHasRecord] = useState(null);
  const [reason, setReason] = useState("");

  return (
    <div className="w-full mx-auto  p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">
        Do you have any past criminal record?
      </h2>
      <div className="flex gap-4">
        <button
          className={`px-4 py-2 rounded-md text-white ${
            hasRecord === true ? "bg-red-600" : "bg-gray-400"
          }`}
          onClick={() => setHasRecord(true)}
        >
          Yes
        </button>
        <button
          className={`px-4 py-2 rounded-md text-white ${
            hasRecord === false ? "bg-green-600" : "bg-gray-400"
          }`}
          onClick={() => setHasRecord(false)}
        >
          No
        </button>
      </div>

      {hasRecord === true && (
        <div className="mt-4">
          <label className="block text-gray-700">Specify Reason:</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter reason"
          />
        </div>
      )}
    </div>
  );
};

export default CriminalRecordCheck;
