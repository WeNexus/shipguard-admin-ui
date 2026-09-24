import { createHashRouter } from "react-router";
import Layout from "./components/layout";
import Login from "./auth/login";
import Dashboard from "./routes/dashboard";
import Orders from "./routes/orders";
import Subscribers from "./routes/subscribers";
import Subscriber from "./routes/subscriber";
import ActivityLogs from "./routes/logs";
import Settings from "./routes/settings";
import Integrations from "./routes/integrations";
import Review from "./routes/review";
import Gql from "./routes/gql";
import Webhooks from "./routes/webhooks";

export const router = createHashRouter([
  { path: "login", element: <Login /> },
  {
    // Authenticated shell (sidebar + topbar); children render into its <Outlet />.
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "orders", element: <Orders /> },
      { path: "subscribers", element: <Subscribers /> },
      // The param is the store DOMAIN (list rows link with `to={store.domain}`), named honestly.
      { path: "subscribers/:domain", element: <Subscriber /> },
      { path: "activity-logs", element: <ActivityLogs /> },
      { path: "settings", element: <Settings /> },
      { path: "integrations", element: <Integrations /> },
      { path: "review", element: <Review /> },
      { path: "gql", element: <Gql /> },
      // No sidebar entry: reached from the dashboard's "Re-register webhooks" button.
      { path: "webhooks", element: <Webhooks /> },
    ],
  },
  { path: "*", element: <>Page Not Found!</> },
]);
