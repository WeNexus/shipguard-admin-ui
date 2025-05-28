import { createHashRouter } from "react-router";
import App from "./App";
import Orders from "./components/orders";
import Layout from "./components/layout";
import Subscribers from "./components/subscribers";
import Subscriber from "./components/subscriber";
import Login from "./auth/login";

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
    path: "*",
    element: <>Page Not Found!</>,
  },
]);
