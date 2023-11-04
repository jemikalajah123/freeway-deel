import client from ".";
import {
  BaseRequestPayload,
  Contract,
  ContractWithJobs,
  GetBestClientResponse,
  GetBestClientsRequestPayload,
  GetBestProfessionRequestPayload,
  GetBestProfessionResponse,
  GetContractByIdRequest,
  GetContractByIdResponse,
  GetContractResponse,
  GetUnpaidJobResponse,
  Job
} from "./models";

export const getContracts = async ({ profileId }: BaseRequestPayload) => {
  try {
    const { data } = await client.get<GetContractResponse>("contracts", {
      headers: { profile_id: profileId }
    });

    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getContractById = async ({ id, profileId }: GetContractByIdRequest) => {
  try {
    const { data } = await client.get<GetContractByIdResponse>(`contracts/${id}`, {
      headers: { profile_id: profileId }
    });

    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getUnpaidJobs = async ({ profileId }: BaseRequestPayload) => {
  try {
    const { data } = await client.get<GetUnpaidJobResponse>("jobs/unpaid", {
      headers: { profile_id: profileId }
    });

    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const PayForJob = async ({ id, profileId }: BaseRequestPayload & { id: number }) => {
  try {
    const { data } = await client.post<unknown>(`jobs/${id}/pay`, undefined, {
      headers: { profile_id: profileId }
    });

    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const DepositToClient = async ({ amount, profileId, id }: BaseRequestPayload &  { amount: number; id: number }) => {
  try {
    const { data } = await client.post<unknown>(`balances/deposit/${id}`, { amount }, {
      headers: { profile_id: profileId }
    });

    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getBestProfession = async ({ start, end }: GetBestProfessionRequestPayload) => {
  try {
    const { data } = await client.get<GetBestProfessionResponse>(`admin/best-profession?start=${start}&end=${end}`);

    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getBestClient = async ({ start, end, limit }: GetBestClientsRequestPayload) => {
  try {
    const { data } = await client.get<GetBestClientResponse>(`admin/best-clients?start=${start}&end=${end}&limit=${limit}`);

    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
