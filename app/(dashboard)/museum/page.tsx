export default function Page() {
  return (
    <div className="relative isolate overflow-hidden bg-white sm:py-32 lg:overflow-visible lg:px-0">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          aria-hidden="true"
          className="absolute top-0 left-[max(50%,25rem)] h-256 w-512 -translate-x-1/2 mask-[radial-gradient(64rem_64rem_at_top,white,transparent)] stroke-gray-200"
        >
          <defs>
            <pattern
              x="50%"
              y={-1}
              id="e813992c-7d03-4cc4-a2bd-151760b470a0"
              width={200}
              height={200}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
            <path
              d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect
            fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)"
            width="100%"
            height="100%"
            strokeWidth={0}
          />
        </svg>
      </div>
      <div className=" grid max-w-2xl grid-cols-1  lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10 md:-mt-30  lg:-mt-30">
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:pr-4">
            <div className="lg:max-w-lg">
              <p className="text-base/7 font-semibold text-indigo-600">
                Platform Details
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
                Museum Dashboard
              </h1>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 ">
          <div className="lg:pr-4">
            <div className="max-w-xl text-base/7 text-gray-600 lg:max-w-lg">
              <ul role="list" className="mt-2 space-y-8 text-gray-600">
                <li className="flex gap-x-3">
                  <span>
                    <strong className="font-semibold text-gray-900">
                      All Artworks.
                    </strong>{" "}
                    Here, you will able to upload new artowrks and manage all of
                    the artworks uploaded by this account.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <span>
                    <strong className="font-semibold text-gray-900">
                      Collection Requests.
                    </strong>{" "}
                    Here, you will get the collection requests from the Curator
                    account. Where you can either approve or reject it.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <span>
                    <strong className="font-semibold text-gray-900">
                      Status:{" "}
                      <strong className="text-yellow-500">PENDING</strong>
                    </strong>{" "}
                    This means, you will have to give access to the requested
                    collection from the curator.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <span>
                    <strong className="font-semibold text-gray-900">
                      Status:{" "}
                      <strong className="text-green-500">APPROVED</strong>
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
                    This means, you have declined the access to the curator for
                    the requested collection.
                  </span>
                </li>

                <li className="flex gap-x-3">
                  <span>
                    <strong className="font-semibold text-gray-900">
                      Status:{" "}
                      <strong className="text-blue-500">COMPLETED</strong>
                    </strong>{" "}
                    This means, the event is succesfull and completed. The
                    artworks are available for creating new collections.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <span>
                    <strong className="font-semibold text-gray-900">
                      Profile.
                    </strong>{" "}
                    Here, you will be able to update your account details.
                  </span>
                </li>
              </ul>
              <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900">
                Feel free to contact if you have any questions?
              </h2>
              <p className="mt-6">Email: ourchidlab@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
