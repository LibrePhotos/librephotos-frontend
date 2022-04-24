import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Cookies } from "react-cookie";

import type { IApiLoginPost, IApiLoginResponse, IApiUserSignUpPost } from "../store/auth/auth.zod";
// eslint-disable-next-line import/no-cycle
import { logout, tokenReceived } from "../store/auth/authSlice";
import type { RootState } from "../store/store";
import type { IUploadOptions, IUploadResponse } from "../store/upload/upload.zod";
import { UploadExistResponse, UploadResponse } from "../store/upload/upload.zod";
import { IApiUserListResponse, IUser, UserSchema } from "../store/user/user.zod";

export enum Endpoints {
  login = "login",
  signUp = "signUp",
  fetchUserList = "fetchUserList",
  fetchUserSelfDetails = "fetchUserSelfDetails",
  fetchPredefinedRules = "fetchPredefinedRules",
  refreshAccessToken = "refreshAccessToken",
  uploadExists = "uploadExists",
  upload = "upload",
}

const baseQuery = fetchBaseQuery({
  baseUrl: "/api/",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",

  prepareHeaders: (headers, { getState, endpoint }) => {
    const cookies = new Cookies();
    headers.set("X-CSRFToken", cookies.get("csrftoken"));
    const { user } = getState() as RootState;
    const { access } = (getState() as RootState).auth;
    if (access !== null && user && endpoint !== "refresh") {
      headers.set("Authorization", `Bearer ${access.token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // try to get a new token
    const refreshToken: string = (api.getState() as RootState).auth?.refresh?.token;
    if (refreshToken) {
      const refreshResult = await baseQuery(
        { url: "/auth/token/refresh/", method: "POST", body: { refresh: refreshToken } },
        api,
        extraOptions
      );
      if (refreshResult.data) {
        // store the new token
        api.dispatch(tokenReceived(refreshResult.data));
        // retry the initial query
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    }
  }
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    [Endpoints.signUp]: builder.mutation<IUser, IApiUserSignUpPost>({
      query: body => ({
        method: "POST",
        body: body,
        url: "/user/",
      }),
      transformResponse: response => UserSchema.parse(response),
    }),
    [Endpoints.login]: builder.mutation<IApiLoginResponse, IApiLoginPost>({
      query: body => ({
        url: "/auth/token/obtain/",
        method: "POST",
        body: body,
      }),
    }),
    [Endpoints.fetchPredefinedRules]: builder.query<any[], void>({
      query: () => "/predefinedrules/",
      transformResponse: (response: string) => JSON.parse(response),
    }),
    [Endpoints.fetchUserSelfDetails]: builder.query<IUser, string>({
      query: userId => `/user/${userId}/`,
      transformResponse: (response: string) => UserSchema.parse(response),
    }),
    [Endpoints.fetchUserList]: builder.query<IApiUserListResponse, void>({
      query: () => ({
        url: "/user/",
        method: "GET",
      }),
    }),
    [Endpoints.uploadExists]: builder.query<boolean, string>({
      query: hash => `/exists/${hash}`,
      transformResponse: (response: string) => UploadExistResponse.parse(response).exists,
    }),
    [Endpoints.upload]: builder.mutation<IUploadResponse, IUploadOptions>({
      query: options => ({
        url: "/upload/",
        method: "POST",
        body: options.form_data,
        headers: {
          // Boundary error when explicitly writing that
          // "Content-Type": "multipart/form-data",
          "Content-Range": `bytes ${options.offset}-${options.offset + options.chunk_size - 1}/${options.chunk_size}`,
        },
      }),
      transformResponse: (response: IUploadResponse) => UploadResponse.parse(response),
    }),
  }),
});
export const {
  useLazyFetchUserListQuery,
  useLazyFetchPredefinedRulesQuery,
  useLazyFetchUserSelfDetailsQuery,
  useFetchUserListQuery,
  useFetchPredefinedRulesQuery,
  useFetchUserSelfDetailsQuery,
  useLoginMutation,
  useSignUpMutation,
} = api;
