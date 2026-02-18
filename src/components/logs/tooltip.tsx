import { useState, useRef } from "react";

type TooltipProps = {
  text: string;
  children:any;
  delay?: number;
};

export function TooltipCustom({ text, children, delay =0 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<any>(null);

  const showTooltip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), delay);
  };

  return (
    <div
      style={{
        position: "relative",
      }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}

      {visible && (
        <div
          style={{
            position: "absolute",
            bottom: "125%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#333",
            color: "#fff",
            padding: "6px 8px",
            borderRadius: "4px",
            fontSize: "14px",
            whiteSpace: "break-spaces",
            wordWrap: "break-word",
            zIndex: 9999,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            maxWidth: "700px",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
