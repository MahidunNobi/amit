import { validateSession } from "@/actions/validateSession";
import React from "react";

const DashboardPage = async () => {
  const res = await validateSession();

  return <div>Dashboard Page</div>;
};

export default DashboardPage;
