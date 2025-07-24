import React from "react";

import { columns} from "./columns";

import { DataTable } from "./data-table";
import { CollectionRequest, fetchCollectionsForMuseumAdminRequests } from "@/actions/collections";

const RequestsPage = async () => {
  const data: CollectionRequest[] =
    await fetchCollectionsForMuseumAdminRequests();

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-3xl font-bold">Collection Requests</h1>
      </div>
      <section>
        <DataTable columns={columns} data={data} />
      </section>
    </div>
  );
};

export default RequestsPage;
