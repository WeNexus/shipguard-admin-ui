import { Box } from "@shopify/polaris";
import AdminOrderCard from "./admin-order-card";
import { useEffect, useMemo, useState } from "react";
import DateRangePicker from "../common/date-range-picker";
import type { IActiveDates } from "../layout/type";
import { default30Days } from "../../utils/default30Days";
import { BASE_URL } from "../../config";
import SubscriberOrderList from "./subscriber-order-list";
import useDebounce from "../../hooks/debounce";

const Orders = () => {
  const [orders, setOrders] = useState<any>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<any>({});
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<string>("all");
  const [queryValue, setQueryValue] = useState("");
  const searchTerm = useDebounce(queryValue, 700);

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
    fetch(
      `${BASE_URL}/admin/api/orders?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=50&filter=${filters}&searchTerm=${searchTerm}`
    )
      .then((res) => res.json())
      .then((res) => {
        setOrders(res.data);
        setPagination(res.pagination);
        setStats(res.stats);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setOrders([]);
        setPagination({});
        setStats({});
        setLoading(false);
      });
  }, [startDate, endDate, page, filters, searchTerm]);
  return (
    <div className="p-6">
      <AdminOrderCard stats={stats} />
      <br />
      <Box paddingBlockEnd={"400"}>
        <div className="flex justify-between">
          <DateRangePicker setActiveDates={setActiveDates} />
        </div>
      </Box>
      <SubscriberOrderList
        orders={orders}
        pagination={pagination}
        withStoreName={true}
        loading={loading}
        setPage={setPage}
        page={page}
        setFilters={setFilters}
        setQueryValue={setQueryValue}
        queryValue={queryValue}
      />
    </div>
  );
};

export default Orders;
