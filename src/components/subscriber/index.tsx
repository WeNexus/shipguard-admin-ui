import { Button, Link } from "@shopify/polaris";
import SubscriberOrderList from "../orders/subscriber-order-list";
import { ArrowLeftIcon } from "@shopify/polaris-icons";
import SubscriberDetailsCart from "./subscriber-details-card";
import AppControlCard from "./app-control-card";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { apiFetch } from "../../lib/api-client";
import type { IPackagePackageProtection, ProtectionOrderList } from "./type";
import useDebounce from "../../hooks/debounce";

const Subscriber = () => {
  // The route param is the store DOMAIN, not an id. It was named `storeId` here and in the old API,
  // which is why the backend endpoint was renamed to `?domain=` (Phase 14) — see the note below.
  const { domain } = useParams<{ domain: string }>();
  const navigate = useNavigate();
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
    // The old Remix route was the `admin.api.$` splat — `GET /admin/api?storeId=<DOMAIN>`, where the
    // param was a misnomer (the loader did `findFirst({ where: { domain } })`). The new backend exposes
    // it honestly as `subscriber-detail?domain=`. `POST /admin/api` is the LOGIN endpoint now, so the
    // old shape could not have been kept even if we wanted to.
    apiFetch("admin/api/subscriber-detail", {
      query: { domain, page, limit: 50, filter: filters, searchTerm },
    })
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
  }, [domain, reFetch, page, filters, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [filters, searchTerm]);

  return (
    <div className="p-6">
      <div className="flex justify-between">
        <div className="flex gap-2">
          {/* navigate(), not location.href — a full reload throws away the token-bearing SPA state
              and re-runs bootstrap for no reason. Keeps the hash router + GitHub Pages base path. */}
          <Button
            icon={ArrowLeftIcon}
            onClick={() => navigate("/subscribers")}
          ></Button>{" "}
          {/* From `store`, not `orders[0]`: a store with zero orders — or any active filter/search
              that returns no rows — used to show the generic fallback even though the response
              carries the real name. */}
          <span className="text-2xl font-bold">
            {store?.name ?? "Subscriber Details"}
          </span>
        </div>
        <div className="text-lg">
          <span className="border px-2 py-1 rounded-lg shadow-sm">Plan</span>{" "}
          <span className="bg-green-400 py-1 px-2 rounded-lg">Active</span>
        </div>
      </div>
      <h2>
        Store domain:{" "}
        <Link url={`https://${domain}`} removeUnderline target="_blank">
          {domain}
        </Link>
      </h2>

      <br />
      <div className="grid gird-cols-2 md:grid-cols-6 lg:grid-cols-11 xl:grid-cols-7 gap-4 ">
        <div className="col-span-1 md:col-span-6 lg:col-span-7 xl:col-span-5">
          <SubscriberDetailsCart
            stats={stats}
            moneyFormat={orders[0]?.Store.currencyCode ?? store?.currencyCode ?? ""}
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
