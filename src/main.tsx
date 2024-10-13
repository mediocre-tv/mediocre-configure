import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/app/App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Stages } from "./routes/Stages.tsx";
import { Zones } from "./routes/Zones.tsx";
import { Regions } from "./routes/Regions.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/stages",
        element: <Stages />,
      },
      {
        path: "/stages/:stageId/zones",
        element: <Zones />,
      },
      {
        path: "/stages/:stageId/zones/:zoneId/regions",
        element: <Regions />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
