import { z } from "zod";

import { PhotoSchema } from "../../actions/photosActions.types";
import { notification } from "../../service/notifications";
import { api } from "../api";

const DeletePhotosRequestSchema = z.object({
  image_hashes: z.array(z.string()),
  deleted: z.boolean(),
});
type DeletePhotosRequest = z.infer<typeof DeletePhotosRequestSchema>;

const DeleteDuplicatePhotoRequestSchema = z.object({
  image_hash: z.string(),
  path: z.string(),
});
type DeleteDuplicatePhotoRequest = z.infer<typeof DeleteDuplicatePhotoRequestSchema>;

const DeletePhotosResponseSchema = z.object({
  status: z.boolean(),
  results: PhotoSchema.array(),
  updated: PhotoSchema.array(),
  not_updated: PhotoSchema.array(),
});
type DeletePhotosResponse = z.infer<typeof DeletePhotosResponseSchema>;

const PurgePhotosRequestSchema = z.object({
  image_hashes: z.array(z.string()),
});
type PurgePhotosRequest = z.infer<typeof PurgePhotosRequestSchema>;

const PurgePhotosResponseSchema = z.object({
  status: z.boolean(),
  results: z.string().array(),
  deleted: z.string().array(),
  not_deleted: z.string().array(),
});
type PurgePhotosResponse = z.infer<typeof PurgePhotosResponseSchema>;

enum Endpoints {
  markPhotosDeleted = "markPhotosDeleted",
  purgeDeletedPhotos = "purgeDeletedPhotos",
  deleteDuplicatePhoto = "deleteDuplicatePhoto",
}

export const deletePhotosApi = api.injectEndpoints({
  endpoints: builder => ({
    [Endpoints.markPhotosDeleted]: builder.mutation<DeletePhotosResponse, DeletePhotosRequest>({
      query: ({ image_hashes, deleted }) => ({
        method: "POST",
        body: { image_hashes, deleted },
        url: "photosedit/setdeleted/",
      }),
      async onQueryStarted({ deleted }, { queryFulfilled }) {
        const response = await queryFulfilled;
        const data = DeletePhotosResponseSchema.parse(response.data);
        notification.togglePhotoDelete(deleted, data.updated.length);
      },
    }),
    [Endpoints.purgeDeletedPhotos]: builder.mutation<PurgePhotosResponse, PurgePhotosRequest>({
      query: ({ image_hashes }) => ({
        method: "DELETE",
        url: "photosedit/delete/",
        body: { image_hashes },
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        const response = await queryFulfilled;
        const data = PurgePhotosResponseSchema.parse(response.data);
        notification.removePhotos(data.deleted.length);
      },
    }),
    [Endpoints.deleteDuplicatePhoto]: builder.mutation<void, DeleteDuplicatePhotoRequest>({
      query: ({ image_hash, path }) => ({
        method: "DELETE",
        url: "photosedit/duplicate/delete/",
        body: { image_hash, path },
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        await queryFulfilled;
        notification.removePhotos(1);
      },
    }),
  }),
});

export const { useMarkPhotosDeletedMutation, usePurgeDeletedPhotosMutation, useDeleteDuplicatePhotoMutation } =
  deletePhotosApi;
