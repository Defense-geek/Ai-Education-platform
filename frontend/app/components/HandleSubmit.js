import React, { useState } from "react";

const HandleSubmit = ({ onSubmit }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmitClick = async () => {
    setIsProcessing(true);
    await onSubmit();
    setIsProcessing(false);
  };

  return (
    <button
      onClick={handleSubmitClick}
      className="mt-4 border-2 border-black rounded-md shadow px-4 py-2 hover:shadow transition duration-200 bg-green-600 text-white flex-shrink-0"
      disabled={isProcessing}
    >
      {isProcessing ? "Submitting..." : "Submit"}
    </button>
  );
};

export default HandleSubmit;
