"use client";

import { fetchData } from "utils/utils";

export default function Page() {
  const { data, isLoading } = fetchData("/api/v1/status");
  return <h1>{isLoading ? "Loading..." : JSON.stringify(data)}</h1>;
}
