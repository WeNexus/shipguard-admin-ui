import { Box, Button, Icon } from "@shopify/polaris";
import { ExportIcon } from "@shopify/polaris-icons";
import SubscribersCart from "./subscripber-card";
import SubscriberList from "./subscriber-list";
import useDebounce from "../../hooks/debounce";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
import * as XLSX from "xlsx";
import type { StoreRecordList } from "./type";
const Subscribers = () => {
  const [data, setSubscribers] = useState<StoreRecordList>([]);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [stats, setStats] = useState<any>({});
  const [filters, setFilters] = useState<string>("all");
  const [queryValue, setQueryValue] = useState("");
  const searchTerm = useDebounce(queryValue, 700);
  const [reFetch, setReFetch] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    fetch(
      `${BASE_URL}/admin/api/subscriber?page=${page}&limit=50&filter=${filters}&searchTerm=${searchTerm}`
    )
      .then((res) => res.json())
      .then((res) => {
        setSubscribers(res.data);
        setPagination(res.pagination);
        setStats(res.stats);
        setLoading(false);
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
        setSubscribers([]);
        setPagination({});
        setStats({});
        setLoading(false);
      });
  }, [page, filters, searchTerm, reFetch]);

  useEffect(() => {
    setPage(1);
  }, [filters, searchTerm]);

  const prepareExportData = (data: any) => {
    return data?.map((order: any) => {
      const totalOrders = order.PackageProtectionOrders.length;
      const protectedOrders = order.PackageProtectionOrders.filter(
        (e: any) => e.hasPackageProtection
      ).length;
      const unProtectedOrders =
        order.PackageProtectionOrders.length - protectedOrders;
      const revenue = order.PackageProtectionOrders?.reduce(
        (sum: any, order: any) => {
          return order.hasPackageProtection
            ? sum + parseFloat(order.orderAmount)
            : sum;
        },
        0
      ).toFixed(2);
      const insuranceEarning = order.PackageProtectionOrders.reduce(
        (a: any, b: any) => a + parseFloat(b.protectionFee),
        0
      ).toFixed(2);

      const conversionRate = isNaN((protectedOrders / totalOrders) * 100)
        ? 0
        : (protectedOrders / totalOrders) * 100;
      const country = order.Timezone.Country.name;
      const { name, plan, development, createdAt } = order;
      return {
        name,
        plan,
        totalOrders,
        protectedOrders,
        unProtectedOrders,
        revenue,
        insuranceEarning,
        conversionRate: conversionRate.toFixed(2),
        country,
        development,
        createdAt,
      };
    });
  };

  const handleExport = () => {
    // fetch export data from the API
    fetch(`${BASE_URL}/admin/api/exports?action=subscriber&filter=${filters}`)
      .then((res) => res.json())
      .then((res) => {
        const xlsxData = prepareExportData(res.data);
        const wb = XLSX.utils.book_new();

        // Convert JSON data to a worksheet
        const ws = XLSX.utils.json_to_sheet(xlsxData as any);

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Generate and download the Excel file
        XLSX.writeFile(wb, "subscribers.xlsx");
      })
      .catch((e) => console.log(e));
  };
  return (
    <div className="p-6">
      <SubscribersCart stats={stats} />
      <br />
      <Box paddingBlockEnd={"400"}>
        <div className="flex justify-end">
          <Button
            variant="primary"
            tone="success"
            onClick={handleExport}
            icon={<Icon source={ExportIcon} />}
          >
            Export
          </Button>
        </div>
      </Box>
      <SubscriberList
        stores={data ?? []}
        pagination={pagination}
        loading={loading}
        setPage={setPage}
        page={page}
        setFilters={setFilters}
        setQueryValue={setQueryValue}
        queryValue={queryValue}
        setReFetch={setReFetch}
      />
    </div>
  );
};

export default Subscribers;
