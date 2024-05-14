import _ from "lodash";
import { z } from "zod";

import {
  FETCH_RECENTLY_ADDED_PHOTOS,
  FETCH_RECENTLY_ADDED_PHOTOS_FULFILLED,
  UserPhotosGroup,
} from "../../actions/photosActions";
import { PigPhotoSchema, SimpleUserSchema } from "../../actions/photosActions.types";
import { notification } from "../../service/notifications";
import { api } from "../api";
import { photoDetailsApi } from "./photoDetail";

const SharedPhotosByMeResponseSchema = z.object({
  results: z
    .object({
      user_id: z.number(),
      user: SimpleUserSchema,
      photo: PigPhotoSchema,
    })
    .array(),
});
const SharedPhotosWithMeResponseSchema = z.object({
  results: PigPhotoSchema.array(),
});

const SharePhotosRequestSchema = z.object({
  image_hashes: z.string().array(),
  val_shared: z.boolean(),
  target_user: SimpleUserSchema,
});
type SharePhotosRequest = z.infer<typeof SharePhotosRequestSchema>;

const RecentlyAddedPhotosResponseSchema = z.object({
  results: PigPhotoSchema.array(),
  date: z.string(),
});
type RecentlyAddedPhotosResponse = z.infer<typeof RecentlyAddedPhotosResponseSchema>;

enum Endpoints {
  fetchSharedPhotosByMe = "fetchSharedPhotosByMe",
  fetchSharedPhotosWithMe = "fetchSharedPhotosWithMe",
  updatePhotoSharing = "updatePhotoSharing",
  fetchRecentlyAddedPhotos = "fetchRecentlyAddedPhotos",
}

export const sharingPhotosApi = api
  .injectEndpoints({
    endpoints: builder => ({
      [Endpoints.fetchSharedPhotosByMe]: builder.query<UserPhotosGroup[], void>({
        query: () => "photos/shared/fromme/",
        transformResponse: response => {
          const { results } = SharedPhotosByMeResponseSchema.parse(response);
          return _.toPairs(_.groupBy(results, "user_id")).map(el => ({
            userId: parseInt(el[0], 10),
            photos: el[1].map(item => item.photo),
          }));
        },
      }),
      [Endpoints.fetchSharedPhotosWithMe]: builder.query<UserPhotosGroup[], void>({
        query: () => "photos/shared/tome/",
        transformResponse: response => {
          const { results } = SharedPhotosWithMeResponseSchema.parse(response);
          return _.toPairs(_.groupBy(results, "owner.id")).map(el => ({ userId: parseInt(el[0], 10), photos: el[1] }));
        },
      }),
      [Endpoints.updatePhotoSharing]: builder.mutation<void, SharePhotosRequest>({
        query: ({ image_hashes, val_shared, target_user }) => ({
          method: "POST",
          body: {
            image_hashes,
            val_shared,
            target_user_id: target_user.id,
          },
          url: "photosedit/share/",
        }),
        async onQueryStarted({ target_user, image_hashes, val_shared }, { queryFulfilled, dispatch }) {
          await queryFulfilled;
          notification.togglePhotoSharing(target_user.username, image_hashes.length, val_shared);
          if (image_hashes.length === 1) {
            // TODO(sickelap): invalidate tags when we have them
            dispatch(photoDetailsApi.endpoints.fetchPhotoDetails.initiate(image_hashes[0])).refetch();
          }
        },
      }),
      [Endpoints.fetchRecentlyAddedPhotos]: builder.query<RecentlyAddedPhotosResponse, void>({
        query: () => "photos/recentlyadded/",
        async onQueryStarted(_args, { queryFulfilled, dispatch }) {
          dispatch({ type: FETCH_RECENTLY_ADDED_PHOTOS });
          const response = await queryFulfilled;
          const { results: photosFlat, date } = RecentlyAddedPhotosResponseSchema.parse(response.data);
          dispatch({
            type: FETCH_RECENTLY_ADDED_PHOTOS_FULFILLED,
            payload: { photosFlat, date },
          });
        },
      }),
    }),
  })
  .enhanceEndpoints<"SharedPhotosByMe" | "SharedPhotosWithMe" | "RecentlyAddedPhotos">({
    addTagTypes: ["SharedPhotosByMe", "SharedPhotosWithMe", "RecentlyAddedPhotos"],
    endpoints: {
      [Endpoints.fetchSharedPhotosByMe]: {
        providesTags: ["SharedPhotosByMe"],
      },
      [Endpoints.fetchSharedPhotosWithMe]: {
        providesTags: ["SharedPhotosWithMe"],
      },
      [Endpoints.fetchRecentlyAddedPhotos]: {
        providesTags: ["RecentlyAddedPhotos"],
      },
    },
  });

export const {
  useFetchSharedPhotosByMeQuery,
  useFetchSharedPhotosWithMeQuery,
  useUpdatePhotoSharingMutation,
  useLazyFetchRecentlyAddedPhotosQuery,
} = sharingPhotosApi;
