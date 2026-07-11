"use client";

import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

interface DropdownItemProps {
  children: React.ReactNode;
  value: string | number;
  selected?: boolean;
  onSelect?: (value: string | number) => void;
}

export function DropdownItem({
  children,
  selected,
  value,
  onSelect,
}: DropdownItemProps) {
  return (
    <div
      onClick={() => onSelect?.(value)}
      className="flex cursor-pointer items-center justify-between px-4 py-2 text-sm hover:bg-gray-600"
    >
      <span>{children}</span>

      <Check
        className={clsx(
          "h-4 w-4 transition-opacity",
          selected ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

type DropdownChild = React.ReactElement<DropdownItemProps, typeof DropdownItem>;

interface DropdownProps {
  value?: string | number;
  placeholder?: string;
  onValueChange?: (value: string | number) => void;
  children: DropdownChild | DropdownChild[];
}

export default function Dropdown({
  value,
  placeholder = "Select an option",
  onValueChange,
  children,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const items = React.Children.toArray(children) as DropdownChild[];

  const hasValue = value !== undefined && value !== null && value !== "";

  const selectedItem = items.find((item) => item.props.value === value);

  const displayValue = value
    ? (selectedItem?.props.children ?? value)
    : placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleOptionClick(selectedValue: string | number) {
    onValueChange?.(selectedValue);
    setIsOpen(false);
  }

  return (
    <div ref={dropdownRef} className="relative inline-block w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-black/5 px-4 py-2 text-sm shadow-sm"
      >
        <span
          className={clsx({
            "text-gray-400": !hasValue,
          })}
        >
          {displayValue}
        </span>

        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-full rounded-md border bg-background shadow-lg">
          {items.map((child) => (
            <DropdownItem
              key={child.props.value}
              value={child.props.value}
              selected={child.props.value === value}
              onSelect={(selectedValue) => {
                handleOptionClick(selectedValue);
                child.props.onSelect?.(selectedValue);
              }}
            >
              {child.props.children}
            </DropdownItem>
          ))}
        </div>
      )}
    </div>
  );
}
