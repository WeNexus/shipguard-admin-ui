import {
  Badge,
  Button,
  EmptySearchResult,
  IndexFilters,
  IndexTable,
  Link,
  Spinner,
  Text,
  useSetIndexFiltersMode,
  type TabProps,
} from "@shopify/polaris";
import { useEffect, useMemo, useState } from "react";
import useDebounce from "../../hooks/debounce";
import { BASE_URL } from "../../config";

const ActivityLogs = () => {
  const [data, setData] = useState<Record<any, any>[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [filterItems, setFilterItems] = useState<any>("");
  const { mode, setMode } = useSetIndexFiltersMode();
  const [selected, setSelected] = useState(0);
  const [page, setPage] = useState<number>(1);
  const [queryValue, setQueryValue] = useState("");
  const searchTerm = useDebounce(queryValue, 500);
  const [itemStrings] = useState([
    "All",
    "INFO",
    "ERROR",
    "BACK END",
    "FRONT END",
  ]);

  const tabs: TabProps[] = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => setFilterItems(item),
    id: `${item}-${index}`,
    isLocked: index === 0,
  }));

  const POLL_INTERVAL = 1000 * 60; // 60 seconds

  useEffect(() => {
    let intervalId = null;
    const abortController = new AbortController();

    const fetchData = () => {
      setLoading(true);
      fetch(
        `${BASE_URL}/admin/api/logs?page=${page}&limit=50&filterItems=${filterItems}&searchTerm=${searchTerm}`,
        { signal: abortController.signal }
      )
        .then((res) => res.json())
        .then((res) => {
          setData(res.widgetLog);
          setPagination(res.pagination);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error(err);
          }
          setData([]);
          setPagination({});
          setLoading(false);
        });
    };

    fetchData(); // Initial fetch
    intervalId = setInterval(fetchData, POLL_INTERVAL);

    return () => {
      abortController.abort();
      if (intervalId) clearInterval(intervalId);
    };
  }, [page, filterItems, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [filterItems, searchTerm]);

  const rowMarkup = useMemo(
    () =>
      data?.map(
        ({ id, type, logFrom, message, createdAt, domain, shop }, index) => {
          const date = new Date(createdAt).toLocaleString();
          return (
            <IndexTable.Row id={id.toString()} key={id} position={index}>
              <IndexTable.Cell>
                <div>
                  <Link url={`https://${domain}`} target="_blank">
                    {" "}
                    <Text as="span">{domain}</Text>
                  </Link>
                  <br />
                  <span>
                    <b>Shop Name:</b> {shop}
                  </span>
                </div>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <span className="capitalize">
                  <Badge
                    progress={type === "INFO" ? "complete" : "incomplete"}
                    tone={type === "INFO" ? "success" : "critical"}
                  >
                    {type}
                  </Badge>
                </span>
              </IndexTable.Cell>
              <IndexTable.Cell>
                <span className="capitalize">
                  <Badge
                    tone={logFrom === "BACK_END" ? "success" : "attention"}
                  >
                    {logFrom}
                  </Badge>
                </span>
              </IndexTable.Cell>

              <IndexTable.Cell>{message as string}</IndexTable.Cell>
              <IndexTable.Cell>{date}</IndexTable.Cell>
            </IndexTable.Row>
          );
        }
      ),
    [data]
  );

  const emptyStateMarkup = (
    <>
      <EmptySearchResult
        title={"No Data Found"}
        description={"Try changing the filters or search term"}
        withIllustration
      />
      {data.length > 0 && (
        <div className="flex justify-center mt-4">
          <Button onClick={() => setFilterItems("")} variant="primary">
            View All Logs
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="p-6">
      <div className="w-full bg-white  rounded-lg shadow-md">
        <IndexFilters
          mode={mode}
          setMode={setMode}
          filters={[]}
          queryValue={queryValue}
          queryPlaceholder="Searching in all"
          onQueryChange={(e) => setQueryValue(e)}
          onClearAll={() => console.log}
          tabs={tabs}
          selected={selected}
          onSelect={setSelected}
          onQueryClear={() => setQueryValue("")}
          cancelAction={{
            onAction: () => setQueryValue(""),
            disabled: false,
            loading: false,
          }}
        />
        <IndexTable
          condensed={false}
          // useBreakpoints().smDown
          // resourceName={{ singular: 'order', plural: 'orders' }}
          itemCount={loading ? Infinity : data.length}
          headings={[
            { title: "Store" },
            { title: "Log Type" },
            { title: "Log From" },
            { title: "Message" },
            { title: "Created At" },
          ]}
          selectable={false}
          emptyState={emptyStateMarkup}
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
        >
          {loading ? (
            <IndexTable.Row id={"loading"} position={1}>
              <IndexTable.Cell colSpan={7}>
                <div className="flex justify-center">
                  <Spinner accessibilityLabel="Loading..." size="large" />
                </div>
              </IndexTable.Cell>
            </IndexTable.Row>
          ) : (
            <>{rowMarkup}</>
          )}
        </IndexTable>
      </div>
    </div>
  );
};

export default ActivityLogs;
