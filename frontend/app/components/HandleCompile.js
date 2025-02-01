import React from "react";

const HandleCompile = ({
  handleCompile,
  sampleInput,
  setCustomInput,
  customInput,
}) => {
  const onCompileClick = () => {
    // If no custom input, set to sampleInput
    if (!customInput || customInput.trim() === "") {
      setCustomInput(sampleInput);
    }
    handleCompile();
  };

  return (
    <button
      onClick={onCompileClick}
      className="mt-4 border-2 border-black rounded-md shadow px-4 py-2 hover:shadow transition duration-200 bg-blue-600 text-white flex-shrink-0"
    >
      Compile with Sample Input
    </button>
  );
};

export default HandleCompile;
