import { useState, useEffect } from "react";

function LineChartForDashboard({ lineData }: any) {
  const [Viz, setViz] = useState<typeof import("@shopify/polaris-viz") | null>(
    null
  );

  useEffect(() => {
    const loadPolarisViz = async () => {
      const viz = await import("@shopify/polaris-viz");

      if (!viz) {
        return;
      }

      setViz(viz);
    };

    loadPolarisViz();
  }, []);

  if (!Viz) return <div>Loading...</div>;

  const chartData = [
    {
      name: "Revenue",
      data: lineData ?? [],
    },
  ];
  return (
    <div className="h-full mt-3">
      <Viz.LineChart data={chartData} />
    </div>
  );
}

export default LineChartForDashboard;
