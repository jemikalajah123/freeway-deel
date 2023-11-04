export type BaseRequestPayload = {
  profileId: string;
};

export type BaseResponseData = {
  statusCode: number;
  message: string;
  success: boolean;
};

export type Job = {
  id: number;
  description: string;
  price: number;
  paid: null;
  paymentDate: null;
  createdAt: string;
  updatedAt: string;
  ContractId:number;
};

export type Contract = {
  id: number;
  terms: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  ContractorId: number;
  ClientId: number;
}

export type ContractWithJobs = Contract & {
  Jobs: Job[];
};

export type GetContractByIdRequest = BaseRequestPayload & {
  id: number;
};

export type GetBestProfessionRequestPayload = {
  start: string;
  end: string;
};

export type GetBestClientsRequestPayload = {
  start: string;
  end: string;
  limit: string;
};

export type GetUnpaidJobResponse = BaseResponseData & {
  data: Job[];
};

export type GetContractResponse = BaseResponseData & {
  data: Contract[];
};

export type GetContractByIdResponse = BaseResponseData & {
  data: ContractWithJobs;
}

export type GetBestProfessionResponse = BaseResponseData & {
  data: {
    profession: string;
    totalEarned: number;
  };
};

export type GetBestClientResponse = BaseResponseData & {
  data: {
    id: number;
    firstName: string;
    lastName: string;
    totalPaid: number;
  }[];
};
