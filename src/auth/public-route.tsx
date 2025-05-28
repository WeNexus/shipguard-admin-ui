import { Navigate } from "react-router";
import useAuth from "../hooks/use-auth";

const PublicRoute = ({ children }: any) => {
  const isLoggedIn = useAuth();

  return !isLoggedIn ? children : <Navigate to="/" />;
};

export default PublicRoute;
