import type { ReactNode } from "react";

// 50/50 columns on desktop, stacked on smaller screens. Columns are explicit (not CSS masonry) so
// opening an accordion in one column never reshuffles cards into the other.
const TwoColumnLayout = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
    {children}
  </div>
);

export default TwoColumnLayout;
