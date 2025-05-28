import {
  useSetIndexFiltersMode,
  useIndexResourceState,
  IndexFilters,
  IndexTable,
  LegacyCard,
  Spinner,
  Badge,
  Text,
} from "@shopify/polaris";
import type { TabProps } from "@shopify/polaris";
import { useState, useMemo, useEffect } from "react";
import { moneyFormater } from "../../utils/money-format";
import SwitchButton from "../common/switch-button";
import type { StoreRecordList } from "./type";
import { BASE_URL } from "../../config";
import { Link } from "react-router";

const SubscriberList = ({
  stores,
  loading,
  pagination,
  page = 1,
  setPage = () => {},
  setFilters = () => {},
  setQueryValue = () => {},
  setReFetch = () => {},
  queryValue,
}: {
  stores: StoreRecordList;
  loading: boolean;
  pagination: Record<string, any>;
  page: number;
  setPage: Function;
  setFilters: Function;
  setQueryValue: Function;

  setReFetch: Function;
  queryValue: string;
}) => {
  const [itemStrings] = useState(["All", "Active", "Inactive"]);

  const tabs: TabProps[] = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {},
    id: `${item}-${index}`,
    isLocked: index === 0,
  }));
  const [selected, setSelected] = useState(0);
  const { mode, setMode } = useSetIndexFiltersMode();

  useEffect(() => {
    if (selected === 0) {
      setFilters("all");
    } else if (selected === 1) {
      setFilters("active");
    } else {
      setFilters("inactive");
    }
  }, [selected]);

  const handleStatusSwitch = (id: string, development: boolean) => {
    const formData = new FormData();
    formData.append("storeId", id);
    formData.append("development", development.toString());
    formData.append("action", "updateStore");

    fetch(`${BASE_URL}/admin/api/subscriber`, {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.success) {
          setReFetch((prev: boolean) => !prev);
        } else {
          console.error(data.error);
        }
      })
      .catch((err) => {
        console.error("Error updating store status:", err);
      });
  };

  const orders = useMemo(() => {
    return stores?.map((store) => {
      const totalOrders = store.PackageProtectionOrders.length;
      const protectedOrders = store.PackageProtectionOrders.filter(
        (e) => e.hasPackageProtection
      ).length;
      const unProtectedOrders =
        store.PackageProtectionOrders.length - protectedOrders;
      const revenue = store.PackageProtectionOrders?.reduce((sum, order) => {
        return order.hasPackageProtection
          ? sum + parseFloat(order.orderAmount)
          : sum;
      }, 0).toFixed(2);
      const insuranceEarning = store.PackageProtectionOrders.reduce(
        (a, b) => a + parseFloat(b.protectionFee),
        0
      ).toFixed(2);

      const conversionRate = isNaN((protectedOrders / totalOrders) * 100)
        ? 0
        : (protectedOrders / totalOrders) * 100;
      const country = store.Timezone.Country.name;

      return {
        id: store.id,
        domain: store.domain,
        storeName: (
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {store.name}
          </Text>
        ),
        plan: <Badge tone="critical">{"Free"}</Badge>,
        totalOrders: totalOrders,
        totalProtectionOrders: protectedOrders,
        totalUnprotectionOrders: unProtectedOrders,
        revenue: moneyFormater(revenue, store.currencyCode),
        insuranceEarning: moneyFormater(insuranceEarning, store.currencyCode),
        conversionRate: conversionRate.toFixed(2),
        country: country,
        storePlan: store.plan,
        status: (
          <SwitchButton
            switchOn={!store.development}
            handleSwitch={() =>
              handleStatusSwitch(store.id, !store.development)
            }
          />
        ),
        createdAt: new Date(store.createdAt).toDateString(),
      };
    });
  }, [stores]);

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(orders);

  const rowMarkup = orders?.map(
    (
      {
        id,
        plan,
        domain,
        status,
        country,
        revenue,
        storeName,
        createdAt,
        storePlan,
        totalOrders,
        conversionRate,
        insuranceEarning,
        totalProtectionOrders,
        totalUnprotectionOrders,
      },
      index
    ) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Link to={`${domain}`} className="text-blue-700">
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {storeName}
            </Text>
          </Link>
        </IndexTable.Cell>
        <IndexTable.Cell>{plan}</IndexTable.Cell>
        <IndexTable.Cell>{totalOrders}</IndexTable.Cell>
        <IndexTable.Cell>{totalProtectionOrders}</IndexTable.Cell>
        <IndexTable.Cell>{totalUnprotectionOrders}</IndexTable.Cell>
        <IndexTable.Cell>{revenue}</IndexTable.Cell>
        <IndexTable.Cell>{insuranceEarning}</IndexTable.Cell>
        <IndexTable.Cell>{conversionRate} % </IndexTable.Cell>
        <IndexTable.Cell>{storePlan}</IndexTable.Cell>
        <IndexTable.Cell>{country}</IndexTable.Cell>
        <IndexTable.Cell>{createdAt}</IndexTable.Cell>
        <IndexTable.Cell>{status}</IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <LegacyCard>
      <IndexFilters
        sortOptions={[]}
        queryValue={queryValue}
        queryPlaceholder="Searching in Store Name"
        onQueryChange={(value: string) => setQueryValue(value)}
        onQueryClear={() => setQueryValue("")}
        tabs={tabs}
        selected={selected}
        onSelect={setSelected}
        filters={[]}
        onClearAll={() => setQueryValue("")}
        cancelAction={{
          onAction: () => {},
          disabled: false,
          loading: false,
        }}
        mode={mode}
        setMode={setMode}
        loading={loading}
      />
      <IndexTable
        condensed={false}
        itemCount={orders.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: "Store Name" },
          { title: "Plan" },
          { title: "Total Orders" },
          { title: "Protected Order" },
          { title: "Unprotected Order" },
          { title: "Secured Revenue" },
          { title: "Insurance Earning" },
          { title: "Conversion Rate" },
          { title: "Shopify Status" },
          { title: "Country" },
          { title: "Created At" },
          { title: "Status" },
        ]}
        pagination={{
          hasPrevious: pagination?.hasPrevPage,
          label: (
            <>
              {page} / {pagination?.totalPages}
            </>
          ),
          hasNext: pagination?.hasNextPage,
          onNext: () => setPage((prev: number) => prev + 1),
          onPrevious: () => setPage((prev: number) => prev - 1),
        }}
        selectable={false}
      >
        {loading ? (
          <IndexTable.Row id={"loading"} position={1}>
            <IndexTable.Cell colSpan={12}>
              <div className="flex justify-center">
                <Spinner accessibilityLabel="Loading..." size="large" />
              </div>
            </IndexTable.Cell>
          </IndexTable.Row>
        ) : (
          <>{rowMarkup}</>
        )}
      </IndexTable>
    </LegacyCard>
  );
};

export default SubscriberList;
