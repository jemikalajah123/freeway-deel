import { useState } from "react";
import { useMutation } from "react-query";

import Loader from "./Loader";
import CustomModal from "./Modal";
import { Contract as ContractModel } from "../lib/models";
import { getContractById } from "../lib/actions";

const Contract = ({ contract, profileId }: { contract: ContractModel; profileId: string }) => {
  const [id, setId] = useState<number | null>(null);

  const { mutateAsync, isLoading, data: contracts } = useMutation(getContractById);

  const handleSelectContract = () => {
    mutateAsync({ id: contract.id, profileId });
    setId(contract.id);
  };

  return (
    <>
      <div className="mb-2 mt-2 flex justify-between cursor-pointer" onClick={handleSelectContract}>
        <div>
          <h2 className={`mb-2 text-lg font-semibold`}>
            {contract.terms}{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 text-sm opacity-50 flex space-x-2`}>
            <span>Status:</span>
            <span>{contract.status}</span>
          </p>
        </div>
        <div className="flex flex-col text-sm opacity-50 space-y-2">
          <span>Created At:</span>
          <span>{contract.createdAt}</span>
        </div>
      </div>
      <hr className="mt-4"  />
      
      <CustomModal
        isOpen={Boolean(id)}
        onClose={() => setId(null)}
        title="Contract Jobs"
      >
        {isLoading ? <Loader /> : (
          <>
            {contracts && contracts?.data.Jobs?.length > 0 ? (
              <div className="flex flex-wrap">
                {contracts.data.Jobs.map((job) => (
                  <div key={job.id} className="flex flex-col space-y-1 w-1/2 border mb-1 p-2">
                    <div>
                      <span className="text-sm">Description:{" "}</span>
                      <span className="text-sm">{job.description}</span>
                    </div>
                    <div>
                      <span className="text-sm">Amount:{" "}</span>
                      <span className="text-sm">USD {job.price.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-sm">Payment Status:{" "}</span>
                      <span className={`text-sm ${job.paid ? "text-green-600" : "text-red-600"}`}>{job.paid ? "PAID" : "NOT PAID"}</span>
                    </div>
                  </div>))}
              </div>
            ) : (
              <span className="block mt-8 text-center text-gray-600 italic">Found no Jobs in this contract...</span>
            )}
          </>
        )}
      </CustomModal>
    </>
  )
};

export default Contract;
