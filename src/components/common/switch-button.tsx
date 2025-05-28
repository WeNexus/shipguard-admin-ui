import React, { useState } from "react";
import { Icon } from "@shopify/polaris";
import { CheckSmallIcon } from "@shopify/polaris-icons";

interface SwitchWithLoadingProps {
  setSwitchOn?: React.Dispatch<React.SetStateAction<boolean>>;
  handleSwitch?: () => void;
  switchOn: boolean;
}
const SwitchButton = ({
  switchOn,
  setSwitchOn = () => {},
  handleSwitch = () => {},
}: SwitchWithLoadingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleToggle = async () => {
    setIsLoading(true);
    // Simulate API call or processing
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setSwitchOn((p) => !p);
    handleSwitch();
  };
  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      style={{
        backgroundColor: switchOn && switchOn ? "#6bce6a" : "#ddd",
      }}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-gray-400 ${
        switchOn ? "bg-gray-900" : "bg-gray-400"
      }`}
    >
      {switchOn ? (
        <span className="absolute left-[2px] top-[2px] text-white">
          <Icon source={CheckSmallIcon} />
        </span>
      ) : null}
      <span
        className={`absolute ${
          switchOn ? "left-2" : "left-1"
        } top-1 flex items-center justify-center w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200",
            ${switchOn ? "translate-x-5" : "translate-x-0"}`}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-3 w-3 text-gray-400"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : switchOn ? (
          ""
        ) : null}
      </span>
    </button>
  );
};

export default SwitchButton;
