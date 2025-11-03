import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { DataTable } from "./data-table";
import { Collection, columns } from "./columns";
import { fetchCollectionsForUser } from "@/actions/collections";
  
const page = async () => {
  const data: Collection[] = await fetchCollectionsForUser();
  return (
    <>
      <div className="flex flex-wrap justify-between">
        <h1 className="text-3xl font-bold mb-6">My Collections</h1>
        <Button className="bg-blue-500" asChild>
          <Link href="/curator/collections/new" className="text-white">
            + Create Collections
          </Link>
        </Button>
      </div>
      <div>
        <div className="lg:pr-4">
          <div>
            <ul
              role="list"
              className="mt-2 space-y-8 text-gray-600 text-justify"
            >
              <li className="flex gap-x-3">
                <span>
                  Here, you will be able to create artwork collections as per
                  your requiremnts, but you have to get the approval from the
                  museum.
                </span>
              </li>
              <li className="flex gap-x-3">
                <span>
                  <strong className="font-semibold text-gray-900">
                    Status: <strong className="text-yellow-500">PENDING</strong>
                  </strong>{" "}
                  This means, you have requested museum for your collections and
                  waiting for the response.
                </span>
              </li>
              <li className="flex gap-x-3">
                <span>
                  <strong className="font-semibold text-gray-900">
                    Status: <strong className="text-green-500">APPROVED</strong>
                  </strong>{" "}
                  This means, museum has granted permission for your requested
                  collection.
                </span>
              </li>
              <li className="flex gap-x-3">
                <span>
                  <strong className="font-semibold text-gray-900">
                    Status: <strong className="text-red-500">REJECTED</strong>
                  </strong>{" "}
                  This means, museum has rejected your requested collection.
                </span>
              </li>

              <li className="flex gap-x-3">
                <span>
                  <strong className="font-semibold text-gray-900">
                    Status: <strong className="text-blue-500">COMPLETED</strong>
                  </strong>{" "}
                  This means, the event is succesfull and completed. You will
                  not be allowed to edit this collection anymore.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <section>
        <DataTable columns={columns} data={data} />
      </section>
    </>
  );
};

export default page;
 