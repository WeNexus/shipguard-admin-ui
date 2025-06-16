import { useMemo, useState } from "react";
import DateRangePicker from "../common/date-range-picker";
import { default30Days } from "../../utils/default30Days";
import type { IActiveDates } from "../layout/type";
import PieChart from "./pie-chart";
import LineChartForDashboard from "./line-chart";
import AdminCard from "./admin-card";

const Dashboard = () => {
  const defaultActiveDates = useMemo(() => default30Days(), []);
  const [, setActiveDates] = useState<IActiveDates>(defaultActiveDates); //activeDates

  const lineData = [
    {
      name: "Total Orders",
      color: "#3b82f6",
      data: [
        { key: "Jan", value: 400 },
        { key: "Feb", value: 500 },
        { key: "Mar", value: 600 },
        { key: "Apr", value: 800 },
        { key: "May", value: 700 },
        { key: "Jun", value: 600 },
        { key: "Jul", value: 800 },
        { key: "Aug", value: 900 },
        { key: "Sep", value: 850 },
        { key: "Oct", value: 950 },
      ],
    },
    {
      name: "Protected",
      color: "#10b981",
      data: [
        { key: "Jan", value: 240 },
        { key: "Feb", value: 300 },
        { key: "Mar", value: 400 },
        { key: "Apr", value: 500 },
        { key: "May", value: 450 },
        { key: "Jun", value: 400 },
        { key: "Jul", value: 550 },
        { key: "Aug", value: 600 },
        { key: "Sep", value: 550 },
        { key: "Oct", value: 650 },
      ],
    },
    {
      name: "Unprotected",
      color: "#ef4444",
      data: [
        { key: "Jan", value: 160 },
        { key: "Feb", value: 200 },
        { key: "Mar", value: 200 },
        { key: "Apr", value: 300 },
        { key: "May", value: 250 },
        { key: "Jun", value: 200 },
        { key: "Jul", value: 250 },
        { key: "Aug", value: 300 },
        { key: "Sep", value: 300 },
        { key: "Oct", value: 300 },
      ],
    },
  ];

  return (
    <>
      <div className="p-6 pb-0 flex gap-4 bg-gray-50">
        <DateRangePicker setActiveDates={setActiveDates} />
      </div>
      <div className="p-4 md:p-6 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
          {/* Total Subscribers */}
          <div className="col-span-2">
            <AdminCard amount={120} title={"Total Subscribers"} />
          </div>

          {/* Subscribers on Basic */}
          <AdminCard amount={85} title={"Subscribers on Basic"} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div className="flex flex-col justify-between gap-6">
            {/* Monthly Recurring Revenue */}
            <div className="bg-[#2b3555] text-white rounded-lg shadow-sm p-6 h-4/5">
              <h2 className="text-lg font-medium">Monthly Recurring Revenue</h2>
              <p className="text-5xl md:text-6xl font-bold mt-2">€2,450.00</p>
            </div>

            {/* New Orders Today */}
            <AdminCard amount={6} title={"New Orders Today"} />
          </div>
          <div className="">
            {/* Order Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Order Overview
              </h2>
              <div className="h-[220px] w-full">
                <LineChartForDashboard lineData={lineData} />
              </div>
              <div className="flex items-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-600">Total Orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">Protected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-600">Unprotected</span>
                </div>
              </div>
            </div>
          </div>
          {/* Claim Rate */}
          <div className=" bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-800">Claim Rate</h2>
            <div className="flex items-center justify-between mt-2">
              {/*<p className="text-6xl font-bold">2%</p>*/}
              {/*<div className="w-24 h-24">fgsffg</div>*/}
              <PieChart pieData={[]} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
