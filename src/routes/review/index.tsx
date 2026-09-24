import {Badge, Banner, Page} from "@shopify/polaris"
import {useEffect, useMemo} from "react";
import { apiFetch } from "../../lib/api-client";
import { ReviewStatisticsData } from "./components/data-table.tsx";
import { useStateData } from "./hooks/use-state-data.ts";
import { ReviewHistoryModal } from "./components/review-history-modal.tsx";

export type ReviewProps = {
  data: {
    Store: {
      domain:string
    },
    storeId: string,
    feedbackMessage: string,
    firstBannerClickCount: number,
    initialBannerReview:number,
    lastShowedAt: string // iso String date
    merchantEmail: string,
  }[],
  totalPage: number,
  totalData: number
} | undefined

export interface StateData {
  reviewData?: ReviewProps
  currentPage: number

  /**
   *
   * All the modal state are listed here
   */

  /**
   * id of that store which we have to show detailed review
   * first we have to change this id then, we have to set **showModal** to true.
   * this allows us to fetch store id
   */
  storeId: string | null;

  /** Set when the review fetch fails, so the page shows an error instead of an empty table. */
  loadError?: string | null;

  /**
   * state of that review, **true** means show data in details
   * **false** - hide modal
   *
   * NOTE: storeId and showModal works together
   */
  showModal: boolean
}

export default function () {
  const initialData = useMemo<StateData>(() => {
    return {
      currentPage: 1,

      storeId: null,
      showModal: false,
      loadError: null,
    }
  }, [])

  const formState = useStateData<StateData>({initialData})

  useEffect(() => {
    // Mode C — first page. The backend caps this at 50 rows/page (PER_PAGE), so despite the
    // "fetch all at once" shape this is genuinely paginated; Next/Previous refetch by page.
    apiFetch("admin/api/review")
      .then((data) => {
        formState.addChange({ reviewData: data, loadError: null })
      })
      .catch((err) => {
        console.error("Failed to load review statistics:", err)
        formState.addChange({ loadError: "Failed to load review statistics." })
      })
  }, []);

  // @ts-ignore
  return (
    <Page fullWidth={true} title={"Reviews Statistics"}>
      <ReviewHistoryModal formState={formState}/>
      {formState.state.loadError && (
        <div style={{marginBottom: "12px"}}>
          <Banner tone="critical">{formState.state.loadError}</Banner>
        </div>
      )}
      <PageStats data={formState.state.reviewData} />
      <div style={{marginBottom: "20px"}}></div>
      <ReviewStatisticsData formState={formState} />
    </Page>
  )
}


function PageStats({
  data
}: { data: ReviewProps }) {
  return (
    <>
      {/*@ts-ignore*/}
      {/*<Badge tone={"info"}> Total Page: {data?.totalPage as any || 0} </Badge> {' '} {' '}*/}
      {/*@ts-ignore*/}
      <Badge tone={"warning"}>Total Data: {data?.totalData || 0}</Badge>
    </>
  )
}
