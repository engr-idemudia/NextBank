"use client";

import { useEffect, useState } from "react";

// Plaid sends transaction dates as plain calendar dates ("2026-10-08"),
// with no time and no time zone.
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const formatOptions: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: true,
};

// Shows a transaction date in the visitor's own time zone.
// Pages are rendered on the server (UTC), so a full timestamp is formatted
// again in the browser after it loads. Plain calendar dates are shown without
// a time, because they do not have one.
const LocalDateTime = ({ value }: { value: string }) => {
  const isDateOnly = DATE_ONLY.test(value);
  const [localText, setLocalText] = useState<string | null>(null);

  useEffect(() => {
    if (!isDateOnly) {
      setLocalText(new Date(value).toLocaleString("en-US", formatOptions));
    }
  }, [value, isDateOnly]);

  if (isDateOnly) {
    // Read the date as UTC so it stays the same calendar day everywhere
    return (
      <span>
        {new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        })}
      </span>
    );
  }

  // Until the browser has formatted it, keep the space with a hidden UTC value
  const serverText = new Date(value).toLocaleString("en-US", {
    ...formatOptions,
    timeZone: "UTC",
  });

  return (
    <time dateTime={value} className={localText ? undefined : "invisible"}>
      {localText ?? serverText}
    </time>
  );
};

export default LocalDateTime;
