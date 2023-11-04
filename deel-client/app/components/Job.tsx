import { useState } from "react";
import { QueryClient, useMutation } from "react-query";
import { ToastContainer, toast } from "react-toastify";

import { Job as JobModel } from "../lib/models";
import { PayForJob } from "../lib/actions";
import CustomModal from "./Modal";

import "react-toastify/dist/ReactToastify.css";

const Job = ({ job, profileId, refetchJobs }: { job: JobModel; profileId: string, refetchJobs: (profileId: string) => void }) => {
  const [id, setId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | undefined>();
  const [failedToPay, setFailedToPay] = useState<string>("");

  const queryClient = new QueryClient();

  const { mutateAsync, isLoading } = useMutation(PayForJob, {
    onSuccess: () => {
      toast("Payment successful!...");
      refetchJobs(profileId);
      setId(null);
      setAmount(undefined);
      queryClient.invalidateQueries(["GET_UNPAID_JOBS", profileId]);
    },
    onError: (error: any) => {
      setFailedToPay(error?.response?.data?.message || "Failed to Pay for JOB. Please try again.");
    }
  });

  const handleSelectJob = () => {
    setId(job.id);
    setAmount(job.price);
  };

  const handleCloseModal = () => {
    setId(null);
    setAmount(undefined);
    setFailedToPay("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFailedToPay("");

    if (id) {
      mutateAsync({ id, profileId })
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2 mt-2">
        <div>
          <h2 className={`flex text-lg mb-2 items-center justify-between`}>
            <span className="font-semibold">{job.description}</span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            USD {job.price.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-2 cursor-pointer" onClick={handleSelectJob}>
          <span>Pay</span>
          <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
            -&gt;
          </span>
        </div>
      </div>
      <hr className="mt-4" />
      
      <CustomModal
        isOpen={Boolean(id)}
        onClose={handleCloseModal}
        title="Pay for Job"
      >
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            value={amount}
            className="w-full h-12 border outline-none pl-2 mt-1 disabled:bg-gray-400 cursor-not-allowed"
            disabled={true}
          />
          <button className="w-full h-12 mt-2 bg-black text-white" type="submit">{isLoading ? "Paying..." : "Pay"}</button>
        </form>
        
        {failedToPay && (<span className="block mt-8 text-center text-red-500 italic">{failedToPay}</span>)}
      </CustomModal>
      <ToastContainer />
    </>
  )
};

export default Job;
