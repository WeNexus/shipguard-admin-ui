import { DataTable, Card, Button } from '@shopify/polaris';
import type { StateData, ReviewProps } from "../index.tsx";
import { useMemo } from "react";
import type { UseStateData } from "../hooks/use-state-data.ts";
import { BASE_URL } from "../../../config";

export function ReviewStatisticsData({ formState }: { formState: UseStateData<StateData> }) {

  const row = prepareData(formState.state.reviewData, formState);

  const paginationInfo = useMemo(() => {
    const totalPage = formState?.state?.reviewData?.totalPage;
    const currentPage = formState?.state?.currentPage;
    const hasNext = !!(totalPage && totalPage > currentPage);
    const hasPrevious = currentPage !== 1;

    const pagination: Record<string, any> = {

    }

    if (hasNext) {
      pagination.hasNext = true;
      pagination.onNext = () => {
        fetch(BASE_URL + `/admin/api/review?page=${currentPage + 1}`).then(res => res.json())
          .then(res => {
            formState.addChange({
              reviewData: res,
              currentPage: currentPage + 1
            })
          })
      }
    } else {
      pagination.hasNext = false;
      pagination.onNext = () => { }
    }

    if (hasPrevious) {
      pagination.hasPrevious = true;
      pagination.onPrevious = () => {
        fetch(BASE_URL + `/admin/api/review?page=${currentPage - 1}`).then(res => res.json())
          .then(res => {
            formState.addChange({
              reviewData: res,
              currentPage: currentPage - 1
            })
          })
      }
    } else {
      pagination.hasPrevious = false;
      pagination.onPrevious = () => { }
    }

    return pagination;
  }, [formState]);

  return (
    <Card padding={'0'}>
      <DataTable
        columnContentTypes={[
          'text',
          'text',
          'numeric',
          'numeric',
          'numeric',
          'numeric',
          "numeric"
        ]}
        headings={[
          'Store',
          'Email',
          'Initial Banner Review',
          'Banner Clicked',
          'Last Showed At',
          "Feedback Message",
          "Action"
        ]}
        rows={row}
        pagination={{
          ...paginationInfo
        }}

      />
    </Card>
  );
}

const prepareData = (data: ReviewProps, formState: UseStateData<StateData>) => {

  const reviewData = useMemo(() => {
    if (data) return data.data;
    else return []
  }, [data])

  if (!data) return [];

  return reviewData.map((review) => {
    const row = [];

    row.push(review.Store.domain);
    row.push(review?.merchantEmail || "N/A");
    row.push(review?.initialBannerReview || "N/A");
    row.push(review?.firstBannerClickCount || "N/A");

    if (review?.lastShowedAt) {
      const localDate = new Date(review?.lastShowedAt);
      row.push(`${localDate.toLocaleDateString()} ${localDate.toLocaleTimeString()}`);
    }
    row.push(review?.feedbackMessage || "N/A");
    row.push(
      <Button
        onClick={() => {
         formState.addChange({ storeId: review.storeId })
         formState.addChange({showModal: true})
        }}
      >
        Details
      </Button>
    )
    return row;
  })
}
