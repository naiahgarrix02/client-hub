"use client";

import { useState } from "react";

interface DropdownProps {
  options: string[] | { id: string; name: string }[];
  onSelect?: (selected: string) => void;
  placeholder?: string;
}

export default function Dropdown({options, onSelect, placeholder = "Select an option"}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Select an option");

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);

    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className="inline-flex w-full justify-between gap-x-1.5 rounded-md bg-black/5 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-500 hover:bg-gray-10"
      >
        {selectedOption}
        <svg
          className="-mr-1 h-5 w-5 text-white"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu Options */}
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map((option) => {
              const label = typeof option === "string" ? option : option.name;
              const value = typeof option === "string" ? option : option.name;
              return (
                <button
                  key={value}
                  onClick={() => handleOptionClick(value)}
                  className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-100 hover:text-gray-900"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
