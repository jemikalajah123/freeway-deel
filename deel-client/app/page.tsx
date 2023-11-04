"use client"

import { useState } from "react";
import Select from "react-select";
import { useMutation, useQuery } from "react-query";
import { ToastContainer, toast } from "react-toastify";
import Link from "next/link";

import Job from "./components/Job";
import Loader from "./components/Loader";
import CustomModal from "./components/Modal";
import Contract from "./components/Contract";
import { DepositToClient, getContracts, getUnpaidJobs } from "./lib/actions";
import { profileOptions } from "./helpers";

import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [amount, setAmount] = useState<number | undefined>();
  const [failedToPay, setFailedToPay] = useState<string>("");
  const [showFundAcctModal, setShowFundAcctModal] = useState<boolean>(false);
  const [profile, setProfile] = useState<{ label: string; value: string }>(profileOptions[0]);

  const { data: contracts, isFetching: isFetchingContracts } = useQuery(["GET_CONTRACTS", profile], () => getContracts({ profileId: profile.value }));

  const { data: unpaidJobs, isFetching: isFetchingUnpaidJobs, refetch } = useQuery(["GET_UNPAID_JOBS", profile], () => getUnpaidJobs({ profileId: profile.value }));

  const { mutate: depositToClient, isLoading: isDepositingToClient } = useMutation(DepositToClient, {
    onSuccess: () => {
      toast("Account funded successfully!...");
      handleCloseModal();
    },
    onError: (error: any) => {
      setFailedToPay(error?.response?.data?.message || "Failed to fund account. Please try again.");
    }
  });

  const handleCloseModal = () => {
    setAmount(undefined);
    setFailedToPay("");
    setShowFundAcctModal(false);
  };

  const handleDepositToClient = (event: React.FormEvent) => {
    event.preventDefault();

    if (amount) {
      depositToClient({
        amount,
        profileId: profile.value,
        id: Number(profile.value)
      })
    }
  };

  return (
    <main className="flex min-h-screen flex-col p-4 lg:px-24 lg:py-12">
      <div className="w-full items-center justify-between font-mono text-sm flex pb-4 lg:pb-8">
        <div className="flex justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black static h-auto w-auto">
          <span className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto">
            By <span className="font-semibold text-2xl">DEEL</span>
          </span>
        </div>
        <p onClick={() => setShowFundAcctModal(true)} className="cursor-pointer left-0 top-0 flex justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 lg:pb-6 lg:pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit w-auto rounded-xl border bg-gray-200 p-4">
          Fund Account
        </p>
      </div>

      <Link
        href="/admin"
        className="cursor-pointer left-0 top-0 flex w-fit mb-2 justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit rounded-xl border bg-gray-200 p-2"
      >
        Go To Admin{" "}
        <span className="font-mono font-bold inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
          -&gt;
        </span>
      </Link>

      <Select options={profileOptions} defaultValue={profile} value={profile} onChange={(option) => setProfile(option as any)} />

      <div className="flex flex-col md:flex-row justify-between space-y-5 lg:space-y-0 lg:space-x-8 mt-4">
        <div className="w-full md:w-1/2">
          <div className="w-full rounded-lg border px-5 py-4 border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30">
            <h2>Contracts</h2>
          </div>
          <div className="w-full rounded-lg border px-5 py-4 border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30">
            {isFetchingContracts ? <Loader /> : (
              <>
                {contracts?.data && (contracts?.data || []).map(contract => (
                  <Contract key={contract.id} contract={contract} profileId={profile.value} />
                ))}
                {(!contracts?.data || contracts?.data?.length < 1) && <span className="block text-center text-gray-600 italic">No contracts found...</span>}
              </>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="w-full rounded-lg border px-5 py-4 border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30">
            <h2>Unpaid Jobs</h2>
          </div>
          <div className="w-full rounded-lg border px-5 py-4 border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30">
            {isFetchingUnpaidJobs ? <Loader /> : (
              <>
                {unpaidJobs?.data && (unpaidJobs?.data || []).map(job => (
                  <Job key={job.id} job={job} profileId={profile.value} refetchJobs={(value: any) => refetch(value)} />
                ))}
                {(!unpaidJobs?.data || unpaidJobs?.data?.length < 1) && <span className="block text-center text-gray-500 italic">No unpaid jobs found...</span>}
              </>
            )}
          </div>
        </div>
      </div>

      <CustomModal
        isOpen={showFundAcctModal}
        onClose={handleCloseModal}
        title="Fund Account"
      >
        <form onSubmit={handleDepositToClient}>
          <label>Enter amount</label>
          <input
            type="number"
            value={amount}
            className="w-full h-12 border outline-none pl-2 mt-1"
            disabled={isDepositingToClient}
            onChange={(e) => {
              setFailedToPay("");
              setAmount(Number(e.target.value))
            }}
          />
          <button className="w-full h-12 mt-2 bg-black text-white" type="submit">{isDepositingToClient ? "Paying..." : "Pay"}</button>
        </form>
        
        {failedToPay && (<span className="block mt-8 text-center text-red-500 italic">{failedToPay}</span>)}
      </CustomModal>
      <ToastContainer />
    </main>
  )
};
