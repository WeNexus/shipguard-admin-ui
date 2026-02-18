import {
  Modal, IndexTable,
  Text,
  Box,
  BlockStack,
} from '@shopify/polaris';
import { useEffect, useState, useMemo } from 'react';
import type { UseStateData } from '../hooks/use-state-data';
import type { StateData } from '..';
import { BASE_URL } from '../../../config';
import { Scrollable } from '@shopify/polaris';

interface ApiResponse {
  analyticsId: string
  storeId: string
  initialBannerReview?: number
  feedbackMessage?: string
  activitySummary?: string
  historyCreatedAt: string
}

export function ReviewHistoryModal({ formState }: { formState: UseStateData<StateData> }) {
  const [data, setData] = useState<ApiResponse[]>([]);
  const [modalLoading, setModalLoading] = useState<boolean>(true)

  useEffect(() => {
    const invalidStoreId = !formState.state.storeId
    if (invalidStoreId) return;

    fetch(`${BASE_URL}/admin/api/review?store_id=${formState.state.storeId}`)
      .then(data => data.json())
      .then(data => {
        setTimeout(() => {
          setModalLoading(false);
        }, 500);

        if (data.data) {
          setData(data.data)
        }
      })
  }, [formState.state.showModal])

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
          <IndexTableComponent data={data} />
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

function formatDate(date: string) {
  const dateObject = new Date(date);

  if (!isValidDate(dateObject)) {
    throw new Error("Date is invalid");
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
