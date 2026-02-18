import {Badge, Page} from "@shopify/polaris"
import {useEffect, useMemo} from "react";
import {BASE_URL} from "../../config";
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
    }
  }, [])

  const formState = useStateData<StateData>({initialData})

  useEffect(() => {
    // fetch all review data at once. could be harmful if data is too large. for now, it should be fine untill 3 million to 4 million data.
    fetch(BASE_URL + "/admin/api/review")
      .then(res => res.json())
      .then((data) => {
        formState.addChange({
          reviewData: data,
        })
      })
      .catch(err => console.log(err))
  }, []);

  // @ts-ignore
  return (
    <Page fullWidth={true} title={"Reviews Statistics"}>
      <ReviewHistoryModal formState={formState}/>
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
