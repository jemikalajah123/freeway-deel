"use client"

import { useState } from "react";
import Link from "next/link";
import Select from "react-select";
import { useQuery } from "react-query";
import DatePicker from "react-date-picker";

import Loader from "../components/Loader";
import { getBestClient, getBestProfession } from "../lib/actions";
import { GetBestClientsRequestPayload, GetBestProfessionRequestPayload } from "../lib/models";
import { limitOptions } from "../helpers";

import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";

export default function Admin() {
  const [bestClientPayload, setBestClientPayload] = useState<GetBestClientsRequestPayload>({
    start: getDefaultStartDate(), end: getRequiredDate(new Date()), limit: "2" 
  });
  const [bestProfessionPayload, setBestProfessionPayload] = useState<GetBestProfessionRequestPayload>({
    start: getDefaultStartDate(), end: getRequiredDate(new Date()) 
  });

  const { data: bestProfessionData, isFetching: isFetchingBestProfession } = useQuery(["GET_BEST_PROFESSION", { ...bestProfessionPayload }], () => getBestProfession({ ...bestProfessionPayload }));

  const { data: bestClients, isFetching: isFetchingBestClients } = useQuery(["GET_BEST_CLIENTS", { ...bestClientPayload }], () => getBestClient({ ...bestClientPayload }));

  const handleBestClientPayloadChange = (label: string, value: Date) => {  
    setBestClientPayload(preVal => {
      return { ...preVal, [label]: getRequiredDate(value) };
    })
  };

  const handleBestProfessionPayloadChange = (label: string, value: Date) => {
    setBestProfessionPayload(preVal => {
      return { ...preVal, [label]: getRequiredDate(value) };
    })
  };

  return (
    <main className="flex min-h-screen flex-col p-4 lg:px-24 lg:py-12">
      <div className="w-full items-center justify-between font-mono text-sm flex pb-4 lg:pb-8">
        <div className="flex justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black static h-auto w-auto">
          <span className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto">
            By <span className="font-semibold text-2xl">DEEL</span>
          </span>
        </div>
        <Link href="/" className="cursor-pointer left-0 top-0 flex justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 lg:pb-6 lg:pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit w-auto rounded-xl border bg-gray-200 p-4">
          <span className="font-mono mr-2 font-bold inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
            &lt;-
          </span>
          Go Back
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between space-y-5 lg:space-y-0 lg:space-x-8 mt-4">
        <div className="w-full md:w-1/2">
          <div className="w-full space-x-0 lg:space-x-2 flex flex-wrap items-center mb-2">
            <Select
              className="grow"
              options={limitOptions}
              defaultValue={{ label: "One", value: "1" }}
              value={limitOptions.find(opt => opt.value == bestClientPayload.limit)}
              onChange={(limit) => setBestClientPayload({ ...bestClientPayload, limit: limit?.value as any })}
            />
            <DatePicker
              showLeadingZeros
              className="bg-white h-9 rounded outline-none border-none grow"
              onChange={(date) => handleBestClientPayloadChange("start", date as Date)}
              value={bestClientPayload.start}
            />
            <DatePicker
              showLeadingZeros
              className="bg-white h-9 rounded outline-none border-none grow"
              maxDate={new Date()}
              value={bestClientPayload.end}
              onChange={(date) => handleBestClientPayloadChange("end", date as Date)}
              minDate={bestClientPayload?.start ? new Date(bestClientPayload.start) : undefined}
            />
          </div>
          <div className="w-full rounded-lg border px-5 py-4 border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30">
            <h2>Best Clients</h2>
          </div>
          <div className="w-full rounded-lg border px-5 py-4 border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30">
            {isFetchingBestClients ? <Loader /> : (
              <>
                {bestClients?.data && (bestClients?.data || []).map(client => (
                  <>
                    <div className="mb-2 mt-2 flex justify-between">
                      <div>
                        <h2 className="mb-2 text-lg font-semibold">
                          {client.firstName}{' '}{client.lastName}
                        </h2>
                        <p className="m-0 text-sm opacity-50 flex space-x-2">
                          <span>Total Paid:</span>
                          <span>{client.totalPaid.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                    <hr className="mt-4"  />
                  </>
                ))}
                {(!bestClients?.data || bestClients?.data?.length < 1) && <span className="block text-center text-gray-600 italic">No data for best clients...</span>}
              </>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="w-full space-x-2 flex items-center mb-2">
            <DatePicker
              showLeadingZeros
              className="bg-white h-9 rounded outline-none border-none grow"
              onChange={(date) => handleBestProfessionPayloadChange("start", date as Date)}
              value={bestProfessionPayload.start}
            />
            <DatePicker
              showLeadingZeros
              className="bg-white h-9 rounded outline-none border-none grow"
              maxDate={new Date()}
              value={bestProfessionPayload.end}
              onChange={(date) => handleBestProfessionPayloadChange("end", date as Date)}
              minDate={bestProfessionPayload?.start ? new Date(bestProfessionPayload.start) : undefined}
            />
          </div>
          <div className="w-full rounded-lg border px-5 py-4 border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30">
            <h2>Best Profession</h2>
          </div>
          <div className="w-full rounded-lg border px-5 py-4 border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30">
            {isFetchingBestProfession ? <Loader /> : (
              <>
                {bestProfessionData?.data?.profession ? (
                  <div>
                    <div className="flex flex-col">
                      <span className="mb-2 text-lg font-semibold">Profession: </span>
                      <span className="m-0 text-sm opacity-50 flex space-x-2">{bestProfessionData?.data?.profession}</span>
                    </div>
                    <hr className="my-4"  />
                    <div className="flex flex-col">
                      <span className="mb-2 text-lg font-semibold">Total Earned: </span>
                      <span className="m-0 text-sm opacity-50 flex space-x-2">{bestProfessionData?.data?.totalEarned.toLocaleString()}</span>
                    </div>
                    <hr className="mt-4"  />
                  </div>
                ) : (
                  <span className="block text-center text-gray-500 italic">No data for best profession...</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
};

const getRequiredDate = (value: Date) => {
  if (value) {
    const date = new Date(value);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${year}-${month}-${day}`
  } else return "";
};

const getDefaultStartDate = () => {
  const date = new Date();

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const oneYearBehind = date.getFullYear() - 1;

  return `${oneYearBehind}-${month}-${day}`
};
