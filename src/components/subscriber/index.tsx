import { Button, Link } from "@shopify/polaris";
import SubscriberOrderList from "../orders/subscriber-order-list";
import { ArrowLeftIcon } from "@shopify/polaris-icons";
import SubscriberDetailsCart from "./subscriber-details-card";
import AppControlCard from "./app-control-card";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { BASE_URL } from "../../config";
import type { IPackagePackageProtection, ProtectionOrderList } from "./type";
import useDebounce from "../../hooks/debounce";

const Subscriber = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [reFetch, setReFetch] = useState<boolean>(false);

  const [orders, setOrders] = useState<ProtectionOrderList>([]);
  const [stats, setStats] = useState<any>({});
  const [store, setStore] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<any>({});
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<string>("all");
  const [queryValue, setQueryValue] = useState("");
  const searchTerm = useDebounce(queryValue, 700);
  const [packageProtection, setPackageProtection] =
    useState<IPackagePackageProtection>({} as IPackagePackageProtection);

  useEffect(() => {
    fetch(
      `${BASE_URL}/admin/api?storeId=${storeId}&page=${page}&limit=50&filter=${filters}&searchTerm=${searchTerm}`
    )
      .then((res) => res.json())
      .then((res) => {
        setStore(res.store)
        setOrders(res.orders);
        setPackageProtection(res.packageProtection);
        setStats(res.stats);
        setPagination(res.pagination);
        setLoading(false);
      })
      .catch((err) => {
        setOrders([]);
        setPagination({});
        setStats({});
        setLoading(false);

        console.error("Error fetching subscriber data:", err);
      });
  }, [storeId, reFetch, page, filters, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [filters, searchTerm]);

  return (
    <div className="p-6">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button
            icon={ArrowLeftIcon}
            onClick={() =>
              (location.href = "/shipguard-admin-ui/#/subscribers/")
            }
          ></Button>{" "}
          <span className="text-2xl font-bold">
            {orders.length > 0 ? orders[0]?.Store.name : "Subscriber Details"}
          </span>
        </div>
        <div className="text-lg">
          <span className="border px-2 py-1 rounded-lg shadow-sm">Plan</span>{" "}
          <span className="bg-green-400 py-1 px-2 rounded-lg">Active</span>
        </div>
      </div>
      <h2>
        Store domain:{" "}
        <Link url={`https://${storeId}`} removeUnderline target="_blank">
          {storeId}
        </Link>
      </h2>

      <br />
      <div className="grid gird-cols-2 md:grid-cols-6 lg:grid-cols-11 xl:grid-cols-7 gap-4 ">
        <div className="col-span-1 md:col-span-6 lg:col-span-7 xl:col-span-5">
          <SubscriberDetailsCart
            stats={stats}
            moneyFormat={orders[0]?.Store.currencyCode ?? "$"}
          />
        </div>
        <div className="col-span-1 md:col-span-6 lg:col-span-4 xl:col-span-2">
          <AppControlCard
            packageProtection={packageProtection}
            setReFetch={setReFetch}
            store={store}
          />
        </div>
      </div>
      <br />
      <SubscriberOrderList
        orders={orders}
        pagination={pagination}
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

export default Subscriber;
