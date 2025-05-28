import { useMemo, type ReactNode } from "react";
import { Icon, Text } from "@shopify/polaris";
import {
  BlogIcon,
  OrderIcon,
  StatusActiveIcon,
  XCircleIcon,
} from "@shopify/polaris-icons";
import { moneyFormater } from "../../utils/money-format";
import type { ProtectionOrderList } from "./type";

const SubscriberDetailsCart = ({ orders }: { orders: ProtectionOrderList }) => {
  const dashboardCartItems: {
    title: string;
    value: number | string;
    bg?: string;
    icon: ReactNode;
  }[] = useMemo(() => {
    const totalOrders = orders.length ?? 0;
    const moneyFormat = orders[0]?.Store.currencyCode ?? "$";
    const protectedOrders =
      orders.filter((e) => e.hasPackageProtection).length ?? 0;
    const unProtectedOrders =
      orders.filter((e) => !e.hasPackageProtection).length ?? 0;
    const conversionRate = isNaN((protectedOrders / totalOrders) * 100)
      ? 0
      : (protectedOrders / totalOrders) * 100;
    const securedRevenue = orders.reduce((sum, order) => {
      return order.hasPackageProtection
        ? sum + parseFloat(order.orderAmount)
        : sum;
    }, 0);
    const insuranceEarning = orders.reduce(
      (sum, order) => sum + parseFloat(order.protectionFee),
      0
    );
    return [
      {
        title: "Total Orders",
        value: orders.length ?? 0,
        bg: "#ffffff",
        icon: (
          <div className="bg-blue-400 p-3 rounded text-white">
            <Icon source={OrderIcon} />
          </div>
        ),
        // icon:<img width='70' src='https://shipguard.nyc3.cdn.digitaloceanspaces.com/ShipGuard%20Widget%20Assets/assets/order-image.png' alt='order-image'/>
      },
      {
        title: "Protected Orders",
        value: protectedOrders,
        bg: "#cff1cf",
        icon: (
          <div className="bg-green-500 p-3 rounded text-white">
            <Icon source={StatusActiveIcon} />
          </div>
        ),
      },
      {
        title: "Unprotected Orders",
        value: unProtectedOrders,
        bg: "#ffd2e9",
        icon: (
          <div className="bg-red-500 p-3 rounded text-white">
            <Icon source={XCircleIcon} />
          </div>
        ),
      },
      {
        title: "Conversion Rate",
        value: `${conversionRate.toFixed(2)}%`,
        bg: "#ffcccc",
        icon: (
          <div className="bg-gray-500 p-3 rounded text-white">
            <Icon source={BlogIcon} />
          </div>
        ),
      },
      {
        title: "Secured Revenue",
        value: moneyFormater(securedRevenue, moneyFormat) ?? 0,
        bg: "#ffaacc",
        icon: (
          <div className="bg-gray-500 p-3 rounded text-white">
            <Icon source={BlogIcon} />
          </div>
        ),
      },
      {
        title: "Insurance Earning",
        value: moneyFormater(insuranceEarning, moneyFormat) ?? 0,
        bg: "#ffccaa",
        icon: (
          <div className="bg-green-500 p-3 rounded text-white">
            <Icon source={BlogIcon} />
          </div>
        ),
      },
    ];
  }, [orders]);

  return (
    //bg-red-300 sm:bg-green-400 md:bg-blue-500 lg:bg-yellow-500 xl:bg-pink-500
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-4 gap-y-4 ">
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

export default SubscriberDetailsCart;
