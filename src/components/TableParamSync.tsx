"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTableNumber } from "@/hooks/useTableNumber";

const TableParamSync = () => {
  const searchParams = useSearchParams();
  const { syncScannedTableNumber } = useTableNumber();

  useEffect(() => {
    const tableValue = searchParams.get("table");
    syncScannedTableNumber(tableValue);
  }, [searchParams, syncScannedTableNumber]);

  return null;
};

export default TableParamSync;
