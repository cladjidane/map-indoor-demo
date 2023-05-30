import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import Root from "./routes/root";
import MapIndoor from "./routes/map-indoor";
import MapIndoorMapbox from "./routes/map-indoor-mapbox";
import ErrorPage from "./error-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: "map-indoor/",
    element: <MapIndoor />,
  },
  {
    path: "map-indoor-mapbox/",
    element: <MapIndoorMapbox />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
