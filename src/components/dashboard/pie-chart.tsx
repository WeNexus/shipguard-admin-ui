import { useEffect, useState } from "react";
const PieChart = ({ pieData }: any) => {
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

  if (!pieData) return null;

  return (
    <div className="h-full mt-3 w-full">
      <Viz.DonutChart
        data={pieData}
        legendPosition="bottom"
        renderInnerValueContent={(v) => {
          const item = pieData[v.activeIndex];
          if (item) {
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                }}
              >
                <span>{item.name}</span> <span>{item.data[0].value}</span>
              </div>
            );
          } else {
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  color: "",
                }}
              >
                <span>Claim</span> <span>{v.totalValue}</span>
              </div>
            );
          }
        }}
      />
    </div>
  );
};

export default PieChart;
