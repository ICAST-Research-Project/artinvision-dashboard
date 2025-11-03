import React from "react";

import { columns } from "./columns";

import { DataTable } from "./data-table";
import {
  CollectionRequest,
  fetchCollectionsForMuseumAdminRequests,
} from "@/actions/collections";

const RequestsPage = async () => {
  const data: CollectionRequest[] =
    await fetchCollectionsForMuseumAdminRequests();

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-3xl font-bold">Collection Requests</h1>
      </div>
      <div className="lg:pr-4">
        <div>
          <ul role="list" className="mt-2 space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <span>
                Here, you will get the collection requests from the Curator
                account. Where you can either approve or reject it.
              </span>
            </li>
            <li className="flex gap-x-3">
              <span>
                <strong className="font-semibold text-gray-900">
                  Status: <strong className="text-yellow-500">PENDING</strong>
                </strong>{" "}
                This means, you will have to give access to the requested
                collection from the curator.
              </span>
            </li>
            <li className="flex gap-x-3">
              <span>
                <strong className="font-semibold text-gray-900">
                  Status: <strong className="text-green-500">APPROVED</strong>
                </strong>{" "}
                This means, you have given the access to the curator for the
                requested collection.
              </span>
            </li>
            <li className="flex gap-x-3">
              <span>
                <strong className="font-semibold text-gray-900">
                  Status: <strong className="text-red-500">REJECTED</strong>
                </strong>{" "}
                This means, you have declined the access to the curator for the
                requested collection.
              </span>
            </li>

            <li className="flex gap-x-3">
              <span>
                <strong className="font-semibold text-gray-900">
                  Status: <strong className="text-blue-500">COMPLETED</strong>
                </strong>{" "}
                This means, the event is succesfull and completed. The artworks
                are available for creating new collections.
              </span>
            </li>
          </ul>
        </div>
      </div>
      <section>
        <DataTable columns={columns} data={data} />
      </section>
    </div>
  );
};

export default RequestsPage;
