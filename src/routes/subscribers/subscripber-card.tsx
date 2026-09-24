import { Icon, Text } from "@shopify/polaris";
import {
  BlogIcon,
  OrderIcon,
  StatusActiveIcon,
  XCircleIcon,
} from "@shopify/polaris-icons";
import { useMemo, type ReactNode } from "react";

import type { IStats } from "./type";

const SubscribersCart = ({ stats }: { stats: IStats }) => {
  const dashboardCartItems: {
    title: string;
    value: number | string;
    bg?: string;
    icon: ReactNode;
  }[] = useMemo(() => {
    return [
      {
        title: "Total Installed",
        value: stats?.totalStore ?? 0,
        bg: "#ffffff",
        icon: (
          <div className="bg-blue-400 p-3 rounded text-white">
            <Icon source={OrderIcon} />
          </div>
        ),
        // icon:<img width='70' src='https://shipguard.nyc3.cdn.digitaloceanspaces.com/ShipGuard%20Widget%20Assets/assets/order-image.png' alt='order-image'/>
      },
      {
        title: "Active",
        value: stats?.totalActive ?? 0,
        bg: "#cff1cf",
        icon: (
          <div className="bg-green-500 p-3 rounded text-white">
            <Icon source={StatusActiveIcon} />
          </div>
        ),
      },
      {
        title: "Inactive",
        value: stats?.totalInactive ?? 0,
        bg: "#ffd2e9",
        icon: (
          <div className="bg-red-500 p-3 rounded text-white">
            <Icon source={XCircleIcon} />
          </div>
        ),
      },
      {
        title: "Trial",
        value: stats?.trial ?? 0,
        bg: "#ffcccc",
        icon: (
          <div className="bg-gray-500 p-3 rounded text-white">
            <Icon source={BlogIcon} />
          </div>
        ),
      },
    ];
  }, [stats]);
  return (
    <div className="grid grid-cols-2  md:grid-cols-4 gap-2 md:gap-4 gap-y-4 ">
      {" "}
      {dashboardCartItems.map((e, i) => (
        <div className="col-span-1 h-full" key={i}>
          <div
            className={`flex justify-between items-center gap-2 border rounded-lg  shadow p-4 h-full`}
            style={{ background: e.bg }}
          >
            <div className="flex flex-col sm:items-start items-center justify-between gap-2 h-full w-full">
              <div className="block sm:hidden ">{e.icon}</div>
              <Text as="span" fontWeight="medium">
                {e.title}
              </Text>
              <span
                className={`font-semibold text-2xl sm:text-4xl ${
                  i === 1 ? "text-green-600" : "text-gray-700"
                }`}
              >
                {e.value}
              </span>
            </div>
            <div className="hidden sm:block">{e.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubscribersCart;
