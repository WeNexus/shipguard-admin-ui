import {Badge, Page} from "@shopify/polaris"
import {useEffect, useMemo} from "react";
import {BASE_URL} from "../../config";
import { ReviewStatisticsData } from "./components/data-table.tsx";
import { useStateData } from "./hooks/use-state-data.ts";

export type ReviewProps = {
  data: {
    Store: {
      domain:string
    },
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
}

export default function () {
  const initialData = useMemo<StateData>(() => {
    return {
      currentPage: 1,
    }
  }, [])

  const formState = useStateData<StateData>({initialData})

  useEffect(() => {
    fetch(BASE_URL + "/admin/api/review")
      .then(res => res.json())
      .then((data) => {
        formState.addChange({
          reviewData: data,
        })
      })
      .catch(err => console.log(err))
  }, []);


  useEffect(() => {
    console.log("formState", formState)
  }, [formState])

  // @ts-ignore
  return (
    <Page fullWidth={true} title={"Reviews Statistics"}>
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
