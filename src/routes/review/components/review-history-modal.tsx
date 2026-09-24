import {
  Modal, IndexTable,
  Text,
  Box,
  BlockStack,
} from '@shopify/polaris';
import { useEffect, useState, useMemo } from 'react';
import type { UseStateData } from '../hooks/use-state-data';
import type { StateData } from '..';
import { apiFetch } from '../../../lib/api-client';
import { Scrollable } from '@shopify/polaris';

interface ApiResponse {
  analyticsId: string
  storeId: string
  initialBannerReview?: number
  feedbackMessage?: string
  activitySummary?: string
  historyCreatedAt: string | null
}

export function ReviewHistoryModal({ formState }: { formState: UseStateData<StateData> }) {
  const [data, setData] = useState<ApiResponse[]>([]);
  const [modalLoading, setModalLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const invalidStoreId = !formState.state.storeId
    if (invalidStoreId) return;

    // Clear the previous store's rows, or opening store B briefly shows store A's history.
    setData([])
    setLoadError(null)

    // Mode A — history for one store. `storeId` here is Store.id (a cuid), which is what the
    // list rows carry; note "storeId" means a DOMAIN elsewhere in this UI (see the subscriber page).
    apiFetch("admin/api/review", { query: { store_id: formState.state.storeId } })
      .then(res => {
        // An empty array is a valid answer (store with no activity), not an error.
        setData(res?.data ?? [])
      })
      .catch(err => {
        // Without this the promise rejected silently and `modalLoading` stayed true forever —
        // the modal just span.
        console.error("Failed to load review history:", err)
        setLoadError("Could not load this store's review history.")
      })
      .finally(() => {
        setTimeout(() => setModalLoading(false), 500)
      })
  }, [formState.state.showModal, formState.state.storeId])

  return (
    <>
      <Modal
        title={"Store Review Activity Detail"}
        open={formState.state.showModal}
        onClose={() => {
          /** reset the modal loading which prepares for next data load animation */
          setModalLoading(true)

          setTimeout(() => {
            formState.addChange({ showModal: false })
          }, 100)

        }}
        loading={modalLoading}
        size='large'
      >
        {/**
         * Modal has adjustable height. Due to this, index table was rendering in a absurd way.
         * Index table was rendering double **table-heading** which should be just one.
         * In order to fix this issue, we had to use Scrollable component
         * which fix the douber heading rendering issue caused by CSS & adjustable height
         *
         */}
        <Scrollable style={{ height: '300px' }}>
          {loadError ? (
            <Box paddingBlock="400">
              <Text as="p" tone="critical" alignment="center">{loadError}</Text>
            </Box>
          ) : (
            <IndexTableComponent data={data} />
          )}
        </Scrollable>
      </Modal>
    </>
  )
}

const IndexTableComponent = ({ data }: { data: ApiResponse[] }) => {

  const resourceName = {
    singular: 'order',
    plural: 'orders',
  };

  const row = useMemo(() => {
    return data.map(eachData => {
      return {
        date: eachData.historyCreatedAt,
        activitySummary: eachData.activitySummary || "Not available",
        initialBannerReview: eachData.initialBannerReview || "Not Given"
      }
    })
  }, [data])


  const rowMarkup = useMemo(() => {
    return row.map((eachRow, index) => (
      <IndexTable.Row
        id={`activity_summary_${index}`}
        key={index}
        position={index}
      >
        <IndexTable.Cell>
          <Text fontWeight="bold" as="span" alignment='center'>
            {formatDate(eachRow.date)}
          </Text>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <Text fontWeight="bold" as="span" alignment='center'>
            {eachRow.initialBannerReview}
          </Text>

        </IndexTable.Cell>

        <IndexTable.Cell>
          <Text as="span" alignment="start" numeric>
            {eachRow.activitySummary}
          </Text>
        </IndexTable.Cell>
      </IndexTable.Row>
    ))
  }, [data])

  return (
    <Box paddingBlockEnd="400">
      <BlockStack gap="200">
        <IndexTable
          resourceName={resourceName}
          itemCount={row.length}
          selectable={false}
          headings={[
            { title: 'Time', alignment: "center" },
            { title: 'Initial Banner Review', alignment: "center" },
            { title: 'Feedback Message', alignment: "start" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </BlockStack>
    </Box>)
}

/**
 * Format a timestamp for display, degrading to a dash on anything unusable.
 *
 * This runs inside a `useMemo` during render, so THROWING here would blank the modal. It previously
 * threw on an invalid date, and `historyCreatedAt` is nullable in the API response — a missing key
 * would have produced `new Date(undefined)` → Invalid Date → crash.
 */
function formatDate(date: string | null | undefined) {
  if (!date) {
    return "—";
  }
  const dateObject = new Date(date);

  if (!isValidDate(dateObject)) {
    return "—";
  }

  // Helper to pad numbers to 2 digits
  const pad = (num: number) => num.toString().padStart(2, '0');

  const day = pad(dateObject.getDate());
  const month = pad(dateObject.getMonth() + 1); // months are 0-indexed
  const year = dateObject.getFullYear();

  let hours = dateObject.getHours();
  const minutes = pad(dateObject.getMinutes());
  const seconds = pad(dateObject.getSeconds());

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // convert 0 → 12 for 12AM
  const hoursStr = pad(hours);

  return `${day}/${month}/${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
}

function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}
