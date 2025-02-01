import React, { useEffect, useState } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { classnames } from "../utils/general";
import { languageOptions } from "../constants/languageOptions";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { defineTheme } from "../lib/defineTheme";
import useKeyPress from "../hooks/useKeyPress";
import OutputWindow from "./OutputWindow";
import CustomInput from "./CustomInput";
import OutputDetails from "./OutputDetails";
import ThemeDropdown from "./ThemeDropdown";
import LanguagesDropdown from "./LanguagesDropdown";

const pythonDefault = ``;

// Hidden test cases and expected outputs
const hiddenTestCases = ["10 -20", "100 200", "-300 -400"];
const expectedOutputs = ["-10", "300", "-700"];

const Landing = () => {
  const [code, setCode] = useState(pythonDefault);
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [theme, setTheme] = useState("cobalt");
  const [language, setLanguage] = useState(languageOptions[0]);

  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");

  const sampleInput = "5 10"; // Add your sample input
  const sampleOutput = "15"; // Add your sample output

  const onSelectChange = (sl) => {
    console.log("selected Option...", sl);
    setLanguage(sl);
  };

  useEffect(() => {
    if (enterPress && ctrlPress) {
      console.log("enterPress", enterPress);
      console.log("ctrlPress", ctrlPress);
      handleCompile();
    }
  }, [ctrlPress, enterPress]);

  const onChange = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };


  const handleCompileWithValidation = () => {
    setProcessing(true);  
    const input = customInput || sampleInput; // Use custom input if provided, else sample input
    const formData = {
      language_id: language.id,
      source_code: btoa(code),
      stdin: btoa(input),
    };
    const options = {
      method: "POST",
      url: process.env.REACT_APP_RAPID_API_URL,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
      },
      data: formData,
    };
    axios
      .request(options)
      .then((response) => {
        const token = response.data.token;
        checkStatusWithValidation(token, sampleOutput);
      })
      
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        // get error status
        let status = err.response.status;
        console.log("status", status);
        if (status === 429) {
          console.log("too many requests", status);

          showErrorToast(
            'Quota of 100 requests exceeded for the Day! Please read the blog on freeCodeCamp to learn how to setup your own RAPID API Judge0!',
            10000
          );
        }
        setProcessing(false);
        console.log("catch block...", error);
      });
  };

  const checkStatusWithValidation = async (token, expectedOutput) => {
    const options = {
      method: "GET",
      url: `${process.env.REACT_APP_RAPID_API_URL}/${token}`,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
      },
    };

    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      if (statusId === 1 || statusId === 2) {
        setTimeout(() => {
          checkStatusWithValidation(token, expectedOutput);
        }, 2000);
        return;
      }

      setProcessing(false);
      const output = atob(response.data.stdout || "").trim();
      setOutputDetails(response.data);

      if (output === expectedOutput) {
        showSuccessToast("Validation Passed!");
      } else {
        showErrorToast("Validation Failed. Expected: " + expectedOutput);
      }
    } catch (err) {
      console.error("Error in checkStatusWithValidation", err);
      setProcessing(false);
      showErrorToast("Error during validation");
    }
  };


  const handleSubmit = async () => {
    let allTestsPassed = true;

    for (let i = 0; i < hiddenTestCases.length; i++) {
      const input = hiddenTestCases[i];
      const expectedOutput = expectedOutputs[i];
      const formData = {
        language_id: language.id,
        source_code: btoa(code),
        stdin: btoa(input),
      };

      const options = {
        method: "POST",
        url: process.env.REACT_APP_RAPID_API_URL,
        params: { base64_encoded: "true", fields: "*" },
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
          "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
        },
        data: formData,
      };

      try {
        const response = await axios.request(options);
        const token = response.data.token;

        // Check status and validate
        const validationResponse = await axios.get(
          `${process.env.REACT_APP_RAPID_API_URL}/${token}`,
          {
            params: { base64_encoded: "true", fields: "*" },
            headers: {
              "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
              "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
            },
          }
        );

        const output = atob(validationResponse.data.stdout || "").trim();
        if (output !== expectedOutput) {
          allTestsPassed = false;
          showErrorToast(`Test case failed. Input: ${input}, Expected: ${expectedOutput}`);
          break;
        }
      } catch (err) {
        console.log("Error during submission", err);
        allTestsPassed = false;
        break;
      }
    }

    if (allTestsPassed) {
      showSuccessToast("All hidden test cases passed!");
    }
  };

  const showSuccessToast = (msg) => {
    toast.success(msg || `Compiled Successfully!`, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const showErrorToast = (msg, timer) => {
    toast.error(msg || `Something went wrong! Please try again.`, {
      position: "top-right",
      autoClose: timer ? timer : 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  function handleThemeChange(th) {
    const theme = th;
    if (["light", "vs-dark"].includes(theme.value)) {
      setTheme(theme);
    } else {
      defineTheme(theme.value).then((_) => setTheme(theme));
    }
  }

  useEffect(() => {
    defineTheme("oceanic-next").then((_) =>
      setTheme({ value: "oceanic-next", label: "Oceanic Next" })
    );
  }, []);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="flex flex-row ml-10">
        <div className="px-4 py-2">
          <LanguagesDropdown onSelectChange={onSelectChange} />
        </div>
        <div className="px-4 py-2">
          <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
        </div>
      </div>
      <div className="flex flex-row space-x-4 items-start px-4 py-4">
        <div className="flex flex-col w-full h-full justify-start items-end">
          <CodeEditorWindow
            code={code}
            onChange={onChange}
            language={language?.value}
            theme={theme.value}
          />
        </div>

        <div className="right-container flex flex-shrink-0 w-[30%] flex-col">
          <OutputWindow outputDetails={outputDetails} />
          <div className="flex flex-col items-end">
            <CustomInput customInput={customInput} setCustomInput={setCustomInput} />
            <button
              onClick={handleCompileWithValidation}
              disabled={!code}
              className={classnames(
                "mt-4 border-2 border-black px-4 py-2 rounded-md bg-black text-white hover:bg-white hover:text-black hover:border-black",
                !code ? "opacity-50" : ""
              )}
            >
              {processing ? "Processing..." : "Compile and Execute"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!code}
              className={classnames(
                "mt-4 border-2 border-green-600 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-white hover:text-green-600 hover:border-green-600",
                !code ? "opacity-50" : ""
              )}
            >
              Submit for Hidden Test Cases
            </button>
          </div>
          {outputDetails && <OutputDetails outputDetails={outputDetails} />}
        </div>
      </div>
    </>
  );
};

export default Landing;
