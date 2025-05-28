import { Box, Text } from "@shopify/polaris";
import AdminOrderCard from "./admin-order-card";
import { useEffect, useMemo, useState } from "react";
import DateRangePicker from "../common/date-range-picker";
import type { IActiveDates } from "../layout/type";
import { default30Days } from "../../utils/default30Days";
import { BASE_URL } from "../../config";
import SubscriberOrderList from "./subscriber-order-list";

const Orders = () => {
  const [orders, setOrders] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const defaultActiveDates = useMemo(() => default30Days(), []);
  const [activeDates, setActiveDates] =
    useState<IActiveDates>(defaultActiveDates);

  const { period } = activeDates || {};
  const startDate = period
    ? new Date(period?.since).toISOString()
    : new Date().toISOString();
  const endDate = period
    ? new Date(
        new Date(period?.until).setDate(new Date(period.until).getDate() + 1)
      ).toISOString()
    : new Date().toISOString();

  useEffect(() => {
    setLoading(true);
    // fetch(
    //   `${BASE_URL}/admin/api/orders?startDate=${startDate}&endDate=${endDate}`
    // )
    //   .then((res) => res.json())
    //   .then((res) => {
    //     console.log(res);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });

    fetch(
      `${BASE_URL}/admin/api/orders?startDate=${startDate}&endDate=${endDate}`
    )
      .then((res) => res.json())
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setOrders([]);
        setLoading(false);
      });
  }, [startDate, endDate]);
  return (
    <div className="p-6">
      <AdminOrderCard data={orders} />
      <br />
      <Box paddingBlockEnd={"400"}>
        <div className="flex justify-between">
          <DateRangePicker setActiveDates={setActiveDates} />
        </div>
      </Box>
      <SubscriberOrderList
        orders={orders}
        withStoreName={true}
        loading={loading}
      />
    </div>
  );
};

export default Orders;
