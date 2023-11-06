import { showNotification } from "@mantine/notifications";
import { z } from "zod";

import { PhotoSuperSimpleSchema } from "../../actions/albumActions.types";
import { DatePhotosGroupSchema, SimpleUserSchema } from "../../actions/photosActions.types";
import i18n from "../../i18n";
import { api } from "../api";

const UserAlbumListSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    cover_photo: PhotoSuperSimpleSchema,
    photo_count: z.number(),
    owner: SimpleUserSchema,
    shared_to: SimpleUserSchema.array(),
    created_on: z.string(),
    favorited: z.boolean(),
  })
  .array();

const UserAlbumListResponseSchema = z.object({
  results: UserAlbumListSchema,
});

export type UserAlbumList = z.infer<typeof UserAlbumListSchema>;

const UserAlbumSchema = z.object({
  id: z.string(),
  title: z.string(),
  owner: SimpleUserSchema,
  shared_to: SimpleUserSchema.array(),
  date: z.string(),
  location: z.string().nullable(),
  grouped_photos: DatePhotosGroupSchema.array(),
});

export type UserAlbum = z.infer<typeof UserAlbumSchema>;

enum Endpoints {
  fetchUserAlbums = "fetchUserAlbums",
  fetchUserAlbum = "fetchUserAlbum",
  createUserAlbum = "createUserAlbum",
  renameUserAlbum = "renameUserAlbum",
  deleteUserAlbum = "deleteUserAlbum",
  removePhotoFromUserAlbum = "removePhotoFromUserAlbum",
  addPhotoToUserAlbum = "addPhotoToUserAlbum",
  setUserAlbumCover = "setUserAlbumCover",
  shareUserAlbum = "shareUserAlbum",
}

export const userAlbumsApi = api
  .injectEndpoints({
    endpoints: builder => ({
      [Endpoints.fetchUserAlbums]: builder.query<UserAlbumList, void>({
        query: () => "albums/user/list/",
        transformResponse: response => UserAlbumListResponseSchema.parse(response).results,
      }),
      [Endpoints.fetchUserAlbum]: builder.query<UserAlbum, string>({
        query: id => `albums/user/${id}/`,
        transformResponse: response => UserAlbumSchema.parse(response),
      }),
      [Endpoints.deleteUserAlbum]: builder.mutation<void, { id: string; albumTitle: string }>({
        query: ({ id }) => ({
          url: `albums/user/${id}/`,
          method: "DELETE",
          body: {},
        }),
        transformResponse: (response, meta, query) => {
          showNotification({
            message: i18n.t("toasts.deletealbum", query),
            title: i18n.t("toasts.deletealbumtitle"),
            color: "teal",
          });
        },
      }),
      [Endpoints.renameUserAlbum]: builder.mutation<void, { id: string; title: string; newTitle: string }>({
        query: ({ id, title }) => ({
          url: `albums/user/${id}/`,
          method: "PATCH",
          body: { title },
        }),
        transformResponse: (response, meta, query) => {
          showNotification({
            message: i18n.t("toasts.renamealbum", {
              oldTitle: query.title,
              newTitle: query.newTitle,
            }),
            title: i18n.t("toasts.renamealbumtitle"),
            color: "teal",
          });
        },
      }),
      [Endpoints.createUserAlbum]: builder.mutation<void, { title: string; photos: string[] }>({
        query: ({ title, photos }) => ({
          url: `albums/user/edit/`,
          method: "POST",
          body: { title, photos },
        }),
        transformResponse: (response, meta, query) => {
          showNotification({
            message: i18n.t("toasts.createnewalbum", {
              title: query.title,
              numberOfPhotos: query.photos.length,
            }),
            title: i18n.t("toasts.createalbumtitle"),
            color: "teal",
          });
        },
      }),
    }),
  })
  .enhanceEndpoints<"UserAlbums" | "UserAlbum">({
    addTagTypes: ["UserAlbums", "UserAlbum"],
    endpoints: {
      [Endpoints.fetchUserAlbums]: {
        providesTags: ["UserAlbums"],
      },
      [Endpoints.fetchUserAlbum]: {
        providesTags: ["UserAlbum"],
      },
      [Endpoints.deleteUserAlbum]: {
        invalidatesTags: ["UserAlbums"],
      },
      [Endpoints.createUserAlbum]: {
        invalidatesTags: ["UserAlbums"],
      },
      // To-Do: Add invalidatesTags for when adding photos to an album / create album
    },
  });

export const {
  useFetchUserAlbumsQuery,
  useLazyFetchUserAlbumsQuery,
  useLazyFetchUserAlbumQuery,
  useDeleteUserAlbumMutation,
  useRenameUserAlbumMutation,
  useCreateUserAlbumMutation,
} = userAlbumsApi;
