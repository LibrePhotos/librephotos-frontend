import { createSlice } from "@reduxjs/toolkit";

import { api } from "../../api_client/api";
import type { IWorkerAvailabilityResponse } from "./worker.zod";
import { WorkerAvailabilityResponse } from "./worker.zod";

const initialState: IWorkerAvailabilityResponse = {
  status: true,
  job_detail: undefined,
  queue_can_accept_job: false,
};

const workerSlice = createSlice({
  name: "worker",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addMatcher(api.endpoints.worker.matchFulfilled, (state, { payload }) => {
      try {
        const parsed = WorkerAvailabilityResponse.parse(payload);
        return { ...state, ...parsed };
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return state;
      }
    });
  },
});

export const worker = workerSlice.reducer;
