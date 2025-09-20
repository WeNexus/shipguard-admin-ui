import { createHashRouter } from "react-router";
import App from "./App";
import Orders from "./components/orders";
import Layout from "./components/layout";
import Subscribers from "./components/subscribers";
import Subscriber from "./components/subscriber";
import Login from "./auth/login";
import ActivityLogs from "./components/logs";
import Settings from "./components/settings";
import Integrations from "./components/integrations";
import Review from "./components/review";

export const router = createHashRouter([
  {},
  { index: true, element: <App /> },
  { path: "login", element: <Login /> },
  {
    path: "orders",
    element: (
      <Layout>
        <Orders />
      </Layout>
    ),
  },
  {
    path: "subscribers",
    element: (
      <Layout>
        <Subscribers />
      </Layout>
    ),
  },
  {
    path: "subscribers/:storeId",
    element: (
      <Layout>
        <Subscriber />
      </Layout>
    ),
  },
  {
    path: "activity-logs",
    element: (
      <Layout>
        <ActivityLogs />
      </Layout>
    ),
  },
  {
    path: "settings",
    element: (
      <Layout>
        <Settings />
      </Layout>
    ),
  },
  {
    path: "integrations",
    element: (
      <Layout>
        <Integrations />
      </Layout>
    ),
  },
  {
    path: "review",
    element: (
      <Layout>
        <Review />
      </Layout>
    ),
  },
  {
    path: "*",
    element: <>Page Not Found!</>,
  },
]);
