import {
  IndexTable,
  LegacyCard,
  IndexFilters,
  useSetIndexFiltersMode,
  Text,
  Badge,
} from "@shopify/polaris";
import type { TabProps } from "@shopify/polaris";
import { useEffect, useMemo, useState } from "react";
import { moneyFormater } from "../../utils/money-format";
import type { ProtectionOrders } from "./type";
import { DateTime } from "luxon";

const SubscriberOrderList = ({
  orders,
  withStoreName = false,
  loading = false,
  pagination,
  page = 1,
  setPage = () => {},
  setFilters = () => {},
  setQueryValue = () => {},
  queryValue,
}: {
  orders: ProtectionOrders;
  withStoreName?: boolean;
  loading?: boolean;
  pagination: Record<string, any>;
  page: number;
  setPage: Function;
  setFilters: Function;
  setQueryValue: Function;
  queryValue: string;
}) => {
  const [itemStrings] = useState(["All", "Protected", "Unprotected"]);

  const tabs: TabProps[] = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {},
    id: `${item}-${index}`,
    isLocked: index === 0,
  }));

  const [selected, setSelected] = useState(0);
  const { mode, setMode } = useSetIndexFiltersMode();

  const headings: any = useMemo(() => {
    if (withStoreName)
      return [
        { title: "Order" },
        { title: "Store Name" },
        { title: "Protection Fees" },
        { title: "Order Amount" },
        { title: "Order Status" },
        { title: "Fulfillment status" },
        { title: "Claim status" },
        { title: "Channel" },
        { title: "Order Date" },
        { title: "Local Time" },
      ];
    return [
      { title: "Order" },
      { title: "Protection Fees" },
      { title: "Order Amount" },
      { title: "Order Status" },
      { title: "Fulfillment status" },
      { title: "Claim status" },
      { title: "Channel" },
      { title: "Order Date" },
      { title: "Local Time" },
    ];
  }, [withStoreName]);

  useEffect(() => {
    if (selected === 0) {
      setFilters("all");
    } else if (selected === 1) {
      setFilters("protected");
    } else {
      setFilters("unprotected");
    }
  }, [selected]);

  const rowMarkup = useMemo(() => {
    return orders?.map(
      (
        {
          id,
          orderName,
          channelName,
          protectionFee,
          orderAmount,
          fulfillmentStatus,
          orderDate,
          hasClaimRequest,
          hasPackageProtection,
          PackageProtectionClaimOrder,
          Store,
        },
        index
      ) => {
        const status = PackageProtectionClaimOrder?.map((i) => i.claimStatus);
        const claimStatus:
          | "Requested"
          | "Processing"
          | "Canceled"
          | "Approved" = status?.every((i) => i === "CANCEL")
          ? "Canceled"
          : status?.every((i) => i === "REQUESTED")
          ? "Requested"
          : status?.every((i) => i === "APPROVE")
          ? "Approved"
          : "Processing";

        const formattedTime = DateTime.fromJSDate(new Date(orderDate), {
          zone: Store.timezoneId,
        }).toFormat("ff");
        const localTime = DateTime.fromJSDate(new Date(orderDate)).toFormat(
          "ff"
        );

        return (
          <IndexTable.Row id={id.toString()} key={id} position={index}>
            <IndexTable.Cell>
              <Text variant="bodyMd" fontWeight="bold" as="span">
                {orderName}
              </Text>
            </IndexTable.Cell>
            {withStoreName && <IndexTable.Cell>{Store.name}</IndexTable.Cell>}
            <IndexTable.Cell>
              {moneyFormater(protectionFee, Store.currencyCode)}
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" numeric>
                {moneyFormater(orderAmount, Store.currencyCode)}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <span className="capitalize">
                <Badge
                  progress={hasPackageProtection ? "complete" : "incomplete"}
                  tone={hasPackageProtection ? "success" : "critical"}
                >
                  {hasPackageProtection ? "Protected" : "Non Protected"}
                </Badge>
              </span>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <span className="capitalize">
                <Badge
                  progress={
                    fulfillmentStatus === "PARTIALLY_FULFILLED"
                      ? "partiallyComplete"
                      : fulfillmentStatus === "FULFILLED"
                      ? "complete"
                      : "incomplete"
                  }
                  tone={
                    fulfillmentStatus === "PARTIALLY_FULFILLED"
                      ? "warning"
                      : fulfillmentStatus === "FULFILLED"
                      ? "success"
                      : "attention"
                  }
                >
                  {fulfillmentStatus.toLowerCase()}
                </Badge>
              </span>
            </IndexTable.Cell>

            <IndexTable.Cell>
              {hasClaimRequest ? (
                <div className="">
                  <Badge
                    progress={
                      claimStatus === "Requested"
                        ? "incomplete"
                        : claimStatus === "Approved"
                        ? "complete"
                        : "partiallyComplete"
                    }
                    tone={
                      claimStatus === "Approved"
                        ? "success"
                        : claimStatus === "Canceled"
                        ? "critical"
                        : claimStatus === "Requested"
                        ? "warning"
                        : "info"
                    }
                  >
                    {claimStatus}
                  </Badge>
                  <Badge
                    tone={
                      claimStatus === "Approved"
                        ? "success"
                        : claimStatus === "Canceled"
                        ? "critical"
                        : claimStatus === "Requested"
                        ? "warning"
                        : "info"
                    }
                  >
                    {PackageProtectionClaimOrder?.length.toString()}
                  </Badge>
                </div>
              ) : (
                <Text as="span" alignment="start">
                  -
                </Text>
              )}
            </IndexTable.Cell>
            <IndexTable.Cell>{channelName ?? "-"}</IndexTable.Cell>
            <IndexTable.Cell>{formattedTime}</IndexTable.Cell>
            <IndexTable.Cell>{localTime}</IndexTable.Cell>
          </IndexTable.Row>
        );
      }
    );
  }, [orders]);

  return (
    <LegacyCard>
      <IndexFilters
        sortOptions={[]}
        queryValue={queryValue}
        queryPlaceholder="Searching in Order Name"
        onQueryChange={(value: string) => setQueryValue(value)}
        onQueryClear={() => setQueryValue("")}
        tabs={tabs}
        selected={selected}
        onSelect={setSelected}
        filters={[]}
        onClearAll={() => setQueryValue("")}
        cancelAction={{
          onAction: () => {
            setQueryValue("");
          },
          disabled: false,
          loading: false,
        }}
        loading={loading}
        mode={mode}
        setMode={setMode}
      />
      <IndexTable
        condensed={false}
        itemCount={orders.length}
        headings={headings}
        loading={loading}
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
        {rowMarkup}
      </IndexTable>
    </LegacyCard>
  );
};

export default SubscriberOrderList;
