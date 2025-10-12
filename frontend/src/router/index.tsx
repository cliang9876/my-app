import { RouteObject, Navigate } from "react-router-dom";
import Users from "../views/Users";
import Home from "../views/Home";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/home" />
  },
  {
    path: "/home",
    element: <Home />
  },
  {
    path: "/users",
    element: <Users />
  }
];

export default routes;
