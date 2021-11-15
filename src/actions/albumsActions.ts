import { Server } from "../api_client/apiClient";
import _ from "lodash";
const reapop = require("reapop");
const notify = reapop.notify;
import { push } from "react-router-redux";
import {
  adjustDateFormat,
  adjustDateFormatForSingleGroup,
  getPhotosFlatFromGroupedByDate,
  addTempElementsToGroups,
} from "../util/util";
import { Dispatch } from "react";
import { DatePhotosGroup, DatePhotosGroupSchema, IncompleteDatePhotosGroup, IncompleteDatePhotosGroupSchema, PersonInfo, PersonInfoSchema, PhotoHashSchema, PigPhoto, SimpleUserSchema } from "./photosActions.types";
import { z } from "zod";

export const AlbumInfoSchema = z.object({
  id: z.number(),
  title: z.string(),
  cover_photos: PhotoHashSchema.array(),
  photo_count: z.number(),
})
export type AlbumInfo = z.infer<typeof AlbumInfoSchema>

const ThingAlbumSchema = z.object({
  id: z.string(),
  title: z.string(),
  grouped_photos: DatePhotosGroupSchema.array(),
})
type ThingAlbum = z.infer<typeof ThingAlbumSchema>

const UserAlbumInfoSchema = AlbumInfoSchema.extend({
  owner: SimpleUserSchema,
  shared_to: SimpleUserSchema.array(),
  created_on: z.string(),
  favorited: z.boolean(),
})
type UserAlbumInfo = z.infer<typeof UserAlbumInfoSchema>

const UserAlbumDetailsSchema = z.object({
  id: z.string(),
  title: z.string(),
  owner: SimpleUserSchema,
  shared_to: SimpleUserSchema.array(),

  date: z.string(),
  location: z.string().nullable(),
})
type UserAlbumDetails = z.infer<typeof UserAlbumDetailsSchema>

const UserAlbumSchema = UserAlbumDetailsSchema.extend({
  grouped_photos: DatePhotosGroupSchema.array(),
})

const _FetchThingAlbumsListResponseSchema = z.object({ results: AlbumInfoSchema.array() })
export function fetchThingAlbumsList() {
  return function (dispatch: Dispatch<any>) {
    dispatch({ type: "FETCH_THING_ALBUMS_LIST" });
    Server.get("albums/thing/list/")
      .then((response) => {
        const data = _FetchThingAlbumsListResponseSchema.parse(response.data);
        const albumInfoList: AlbumInfo[] = data.results;
        dispatch({
          type: "FETCH_THING_ALBUMS_LIST_FULFILLED",
          payload: albumInfoList,
        });
      })
      .catch((err) => {
        dispatch({ type: "FETCH_THING_ALBUMS_LIST_REJECTED", payload: err });
      });
  };
}

const _FetchThingAlbumResponseSchema = z.object({ results: ThingAlbumSchema })
export function fetchThingAlbum(album_id: string) {
  return function (dispatch: Dispatch<any>) {
    dispatch({ type: "FETCH_THING_ALBUMS" });
    Server.get(`albums/thing/${album_id}/`)
      .then((response) => {
        const data = _FetchThingAlbumResponseSchema.parse(response.data);
        const thingAlbum: ThingAlbum = data.results;
        dispatch({
          type: "FETCH_THING_ALBUMS_FULFILLED",
          payload: thingAlbum,
        });
      })
      .catch((err) => {
        dispatch({ type: "FETCH_THING_ALBUMS_REJECTED", payload: err });
      });
  };
}

const _FetchUserAlbumsListResponseSchema = z.object({ results: UserAlbumInfoSchema.array() })
export function fetchUserAlbumsList() {
  return function (dispatch: Dispatch<any>) {
    dispatch({ type: "FETCH_USER_ALBUMS_LIST" });
    Server.get("albums/user/list/")
      .then((response) => {
        const data = _FetchUserAlbumsListResponseSchema.parse(response.data);
        const userAlbumInfoList: UserAlbumInfo[] = data.results;
        dispatch({
          type: "FETCH_USER_ALBUMS_LIST_FULFILLED",
          payload: userAlbumInfoList,
        });
      })
      .catch((err) => {
        dispatch({ type: "FETCH_USER_ALBUMS_LIST_REJECTED", payload: err });
      });
  };
}

export type FetchUserAlbumAction =
  | { type: "FETCH_USER_ALBUM" }
  | { type: "FETCH_USER_ALBUM_FULFILLED", payload: { photosGroupedByDate: DatePhotosGroup[], photosFlat: PigPhoto[], albumDetails: UserAlbumDetails } }
  | { type: "FETCH_USER_ALBUM_REJECTED", payload: string }
export function fetchUserAlbum(album_id: number) {
  return function (dispatch: Dispatch<FetchUserAlbumAction>) {
    dispatch({ type: "FETCH_USER_ALBUM" });
    Server.get(`albums/user/${album_id}/`)
      .then((response) => {
        const data = UserAlbumSchema.parse(response.data);
        var photosGroupedByDate: DatePhotosGroup[] = data.grouped_photos;
        adjustDateFormat(photosGroupedByDate);
        var albumDetails: UserAlbumDetails = data;
        dispatch({
          type: "FETCH_USER_ALBUM_FULFILLED",
          payload: {
            photosGroupedByDate: photosGroupedByDate,
            photosFlat: getPhotosFlatFromGroupedByDate(photosGroupedByDate),
            albumDetails: albumDetails,
          },
        });
      })
      .catch((err) => {
        dispatch({ type: "FETCH_USER_ALBUM_REJECTED", payload: err });
      });
  };
}

const _UserAlbumEditResponseSchema = z.object({
  id: z.number(),
  title: z.string().nullable(),
  photos: z.string().array(),
  created_on: z.string(),
  favorited: z.boolean(),
  removedPhotos: z.string().array().optional(),
})
export function createNewUserAlbum(title: string, image_hashes: string[]) {
  return function (dispatch: Dispatch<any>) {
    dispatch({ type: "CREATE_USER_ALBUMS_LIST" });
    Server.post("albums/user/edit/", { title: title, photos: image_hashes })
      .then((response) => {
        const data = _UserAlbumEditResponseSchema.parse(response.data);
        dispatch({
          type: "CREATE_USER_ALBUMS_LIST_FULFILLED",
          payload: data,
        });
        dispatch(fetchUserAlbumsList());
        dispatch(
          notify({
            message: `${image_hashes.length} photo(s) were successfully added to new album "${title}"`,
            title: "Create album",
            status: "success",
            dismissible: true,
            dismissAfter: 3000,
            position: "br",
            buttons: [
              {
                name: "View Album",
                primary: true,
                onClick: () => {
                  dispatch(fetchUserAlbum(data.id));
                  dispatch(push(`/useralbum/${data.id}/`));
                },
              },
            ],
          })
        );
      })
      .catch((err) => {
        dispatch({ type: "CREATE_USER_ALBUMS_LIST_REJECTED", payload: err });
      });
  };
}

export function renameUserAlbum(albumID: string, albumTitle: string, newAlbumTitle: string) {
  return function (dispatch: Dispatch<any>) {
    dispatch({ type: "RENAME_USER_ALBUM" });
    Server.patch(`/albums/user/edit/${albumID}/`, {
      title: newAlbumTitle,
    })
      .then((response) => {
        dispatch({ type: "RENAME_USER_ALBUM_FULFILLED", payload: albumID });
        dispatch(fetchUserAlbumsList());
        dispatch(
          notify({
            message: `${albumTitle} was successfully renamed to ${newAlbumTitle}.`,
            title: "Rename album",
            status: "success",
            dismissible: true,
            dismissAfter: 3000,
            position: "br",
          })
        );
      })
      .catch((err) => {
        dispatch({ type: "RENAME_USER_ALBUM_REJECTED", payload: err });
      });
  };
}

export function deleteUserAlbum(albumID: string, albumTitle: string) {
  return function (dispatch: Dispatch<any>) {
    dispatch({ type: "DELETE_USER_ALBUM" });
    Server.delete(`/albums/user/${albumID}`)
      .then((response) => {
        dispatch({ type: "DELETE_USER_ALBUM_FULFILLED", payload: albumID });
        dispatch(fetchUserAlbumsList());
        dispatch(
          notify({
            message: `${albumTitle} was successfully deleted.`,
            title: "Delete album",
            status: "success",
            dismissible: true,
            dismissAfter: 3000,
            position: "br",
          })
        );
      })
      .catch((err) => {
        dispatch({ type: "DELETE_USER_ALBUM_REJECTED", payload: err });
      });
  };
}

export function removeFromUserAlbum(album_id: number, title: string, image_hashes: string[]) {
  return function (dispatch: Dispatch<any>) {
    dispatch({ type: "REMOVE_USER_ALBUMS_LIST" });
    Server.patch(`albums/user/edit/${album_id}/`, {
      removedPhotos: image_hashes,
    })
      .then((response) => {
        const data = _UserAlbumEditResponseSchema.parse(response.data);
        dispatch({
          type: "REMOVE_USER_ALBUMS_LIST_FULFILLED",
          payload: data,
        });
        dispatch(
          notify({
            message: `${image_hashes.length} photo(s) were successfully removed from album "${title}"`,
            title: "Removed from album",
            status: "success",
            dismissible: true,
            dismissAfter: 3000,
            position: "br",
          })
        );
        dispatch(fetchUserAlbumsList());
        dispatch(fetchUserAlbum(album_id));
      })
      .catch((err) => {
        dispatch({ type: "REMOVE_USER_ALBUMS_LIST_REJECTED", payload: err });
      });
  };
}

export function addToUserAlbum(album_id: number, title: string, image_hashes: string[]) {
  return function (dispatch: Dispatch<any>) {
    dispatch({ type: "EDIT_USER_ALBUMS_LIST" });
    Server.patch(`albums/user/edit/${album_id}/`, {
      title: title,
      photos: image_hashes,
    })
      .then((response) => {
        const data = _UserAlbumEditResponseSchema.parse(response.data);
        dispatch({
          type: "EDIT_USER_ALBUMS_LIST_FULFILLED",
          payload: data,
        });
        dispatch(
          notify({
            message: `${image_hashes.length} photo(s) were successfully added to existing album "${title}"`,
            title: "Add to album",
            status: "success",
            dismissible: true,
            dismissAfter: 3000,
            position: "br",
            buttons: [
              {
                name: "View Album",
                primary: true,
                onClick: () => {
                  dispatch(fetchUserAlbum(album_id));
                  dispatch(push(`/useralbum/${album_id}/`));
                },
              },
            ],
          })
        );
        dispatch(fetchUserAlbumsList());
      })
      .catch((err) => {
        dispatch({ type: "EDIT_USER_ALBUMS_LIST_REJECTED", payload: err });
      });
  };
}

export const PlaceAlbumInfoSchema = AlbumInfoSchema.extend({
  geolocation_level: z.number(),
})
export type PlaceAlbumInfo = z.infer<typeof PlaceAlbumInfoSchema>
const _FetchPlaceAlbumsListResponseSchema = z.object({ results: PlaceAlbumInfoSchema.array() })
export function fetchPlaceAlbumsList() {
  return function (dispatch: Dispatch<any>) {
    dispatch({ type: "FETCH_PLACE_ALBUMS_LIST" });
    Server.get("albums/place/list/")
      .then((response) => {
        const data = _FetchPlaceAlbumsListResponseSchema.parse(response.data);
        const placeAlbumInfoList: PlaceAlbumInfo[] = data.results;
        var byGeolocationLevel = _.groupBy(
          placeAlbumInfoList,
          (el) => el.geolocation_level
        );
        dispatch({
          type: "GROUP_PLACE_ALBUMS_BY_GEOLOCATION_LEVEL",
          payload: byGeolocationLevel,
        });
        dispatch({
          type: "FETCH_PLACE_ALBUMS_LIST_FULFILLED",
          payload: placeAlbumInfoList,
        });
      })
      .catch((err) => {
        dispatch({ type: "FETCH_PLACE_ALBUMS_LIST_REJECTED", payload: err });
      });
  };
}

const PlaceAlbumSchema = z.object({
  id: z.string(),
  title: z.string(),
  grouped_photos: DatePhotosGroupSchema.array()
})
const PlaceAlbumResponseSchema = z.object({ results: PlaceAlbumSchema })
export function fetchPlaceAlbum(album_id: string) {
  return function (dispatch: Dispatch<any>) {
    dispatch({ type: "FETCH_PLACE_ALBUMS" });
    Server.get(`albums/place/${album_id}/`)
      .then((response) => {
        const data = PlaceAlbumResponseSchema.parse(response.data)
        dispatch({
          type: "FETCH_PLACE_ALBUMS_FULFILLED",
          payload: data,
        });
      })
      .catch((err) => {
        dispatch({ type: "FETCH_PLACE_ALBUMS_REJECTED", payload: err });
      });
  };
}

const PersonPhotosSchema = PersonInfoSchema.extend({
  grouped_photos: DatePhotosGroupSchema.array(),
})
const _FetchPersonPhotosResponseSchema = z.object({ results: PersonPhotosSchema })
export type FetchPersonPhotosAction =
  | { type: "FETCH_PERSON_PHOTOS" }
  | { type: "FETCH_PERSON_PHOTOS_FULFILLED", payload: { photosGroupedByDate: DatePhotosGroup[], photosFlat: PigPhoto[], personDetails: PersonInfo } }
  | { type: "FETCH_PERSON_PHOTOS_REJECTED", payload: string }
export function fetchPersonPhotos(person_id: string) {
  return function (dispatch: Dispatch<FetchPersonPhotosAction>) {
    dispatch({ type: "FETCH_PERSON_PHOTOS" });
    Server.get(`albums/person/${person_id}/`)
      .then((response) => {
        const data = _FetchPersonPhotosResponseSchema.parse(response.data)
        var photosGroupedByDate: DatePhotosGroup[] = data.results.grouped_photos;
        adjustDateFormat(photosGroupedByDate);
        var personDetails: PersonInfo = data.results;
        dispatch({
          type: "FETCH_PERSON_PHOTOS_FULFILLED",
          payload: {
            photosGroupedByDate: photosGroupedByDate,
            photosFlat: getPhotosFlatFromGroupedByDate(photosGroupedByDate),
            personDetails: personDetails,
          },
        });
      })
      .catch((err) => {
        dispatch({ type: "FETCH_PERSON_PHOTOS_REJECTED", payload: err });
      });
  };
}

export const PersonSchema = z.object({
  name: z.string(),
  face_url: z.string(),
  face_count: z.number(),
  face_photo_url: z.string(),
  id: z.number(),
  newPersonName: z.string().optional(),
})
export type Person = z.infer<typeof PersonSchema>
const PhotoSimpleSchema = z.object({
  square_thumbnail: z.string(),
  image: z.string().nullable(),
  image_hash: z.string(),
  exif_timestamp: z.string(),
  exif_gps_lat: z.number().nullable(),
  exif_gps_lon: z.number().nullable(),
  rating: z.number(),
  geolocation_json: z.any(),
  public: z.boolean(),
  video: z.boolean(),
})
const AutoAlbumSchema = z.object({
  id: z.number(),
  title: z.string(),
  favorited: z.boolean(),
  timestamp: z.string(),
  created_on: z.string(),
  gps_lat: z.number().nullable(),
  people: PersonSchema.array(),
  gps_lon: z.number().nullable(),
  photos: PhotoSimpleSchema.array(),
})
type AutoAlbum = z.infer<typeof AutoAlbumSchema>

const AutoAlbumInfoSchema = z.object({
  id: z.number(),
  title: z.string(),
  timestamp: z.string(),
  photos: PhotoHashSchema,  // TODO: This is a single photo, so the property name should be corrected. Perhaps cover_photo?
  photo_count: z.number(),
  favorited: z.boolean(),
})
type AutoAlbumInfo = z.infer<typeof AutoAlbumInfoSchema>

//actions using new list view in backend

const _FetchAutoAlbumsListResponseSchema = z.object({ results: AutoAlbumInfoSchema.array() })
export function fetchAutoAlbumsList() {
  return function (dispatch: Dispatch<any>) {
    dispatch({ type: "FETCH_AUTO_ALBUMS_LIST" });
    Server.get("albums/auto/list/")
      .then((response) => {
        const data = _FetchAutoAlbumsListResponseSchema.parse(response.data);
        const autoAlbumsList: AutoAlbumInfo[] = data.results;
        dispatch({
          type: "FETCH_AUTO_ALBUMS_LIST_FULFILLED",
          payload: autoAlbumsList,
        });
      })
      .catch((err) => {
        dispatch({ type: "FETCH_AUTO_ALBUMS_LIST_REJECTED", payload: err });
      });
  };
}

export type FetchDateAlbumsListAction =
  | { type: "FETCH_DATE_ALBUMS_LIST" }
  | { type: "FETCH_DATE_ALBUMS_LIST_FULFILLED", payload: { photosGroupedByDate: IncompleteDatePhotosGroup[], photosFlat: PigPhoto[] } }
  | { type: "FETCH_DATE_ALBUMS_LIST_REJECTED", payload: string }
const _FetchDateAlbumsListResponseSchema = z.object({ results: IncompleteDatePhotosGroupSchema.array() })
export function fetchDateAlbumsList() {
  return function (dispatch: Dispatch<FetchDateAlbumsListAction>) {
    dispatch({ type: "FETCH_DATE_ALBUMS_LIST" });
    Server.get("albums/date/list/", { timeout: 100000 })
      .then((response) => {
        const data = _FetchDateAlbumsListResponseSchema.parse(response.data);
        const photosGroupedByDate: IncompleteDatePhotosGroup[] = data.results;
        adjustDateFormat(photosGroupedByDate);
        addTempElementsToGroups(photosGroupedByDate);
        dispatch({
          type: "FETCH_DATE_ALBUMS_LIST_FULFILLED",
          payload: {
            photosGroupedByDate: photosGroupedByDate,
            photosFlat: getPhotosFlatFromGroupedByDate(photosGroupedByDate),
          },
        });
      })
      .catch((err) => {
        dispatch({ type: "FETCH_DATE_ALBUMS_LIST_REJECTED", payload: err });
      });
  };
}

//actions using new retrieve view in backend
export function fetchAlbumsAutoGalleries(album_id: string) {
  return function (dispatch: Dispatch<any>) {
    dispatch({ type: "FETCH_AUTO_ALBUMS_RETRIEVE" });
    Server.get(`albums/auto/${album_id}/`)
      .then((response) => {
        const autoAlbum: AutoAlbum = AutoAlbumSchema.parse(response.data);
        dispatch({
          type: "FETCH_AUTO_ALBUMS_RETRIEVE_FULFILLED",
          payload: autoAlbum,
        });
      })
      .catch((err) => {
        dispatch({ type: "FETCH_AUTO_ALBUMS_RETRIEVE_REJECTED", payload: err });
      });
  };
}

export type FetchDateAlbumsRetrieveAction =
  | { type: "FETCH_DATE_ALBUMS_RETRIEVE", payload: { album_id: string } }
  | { type: "FETCH_DATE_ALBUMS_RETRIEVE_FULFILLED", payload: { datePhotosGroup: IncompleteDatePhotosGroup } }
  | { type: "FETCH_DATE_ALBUMS_RETRIEVE_REJECTED", payload: string }
export function fetchAlbumsDateGalleries(album_id: string) {
  return function (dispatch: Dispatch<FetchDateAlbumsRetrieveAction>) {
    dispatch({
      type: "FETCH_DATE_ALBUMS_RETRIEVE",
      payload: {
        album_id: album_id,
      },
    });
    Server.get(`albums/date/${album_id}/`)
      .then((response) => {
        const datePhotosGroup: IncompleteDatePhotosGroup = IncompleteDatePhotosGroupSchema.parse(response.data);
        adjustDateFormatForSingleGroup(datePhotosGroup);
        dispatch({
          type: "FETCH_DATE_ALBUMS_RETRIEVE_FULFILLED",
          payload: {
            datePhotosGroup: datePhotosGroup,
          },
        });
      })
      .catch((err) => {
        console.log(err);
        dispatch({ type: "FETCH_DATE_ALBUMS_RETRIEVE_REJECTED", payload: err });
      });
  };
}

// share user album
export function setUserAlbumShared(album_id: number, target_user_id: string, val_shared: boolean) {
  return function (dispatch: Dispatch<any>) {
    dispatch({ type: "SET_ALBUM_USER_SHARED" });
    Server.post("useralbum/share/", {
      shared: val_shared,
      album_id: album_id,
      target_user_id: target_user_id,
    })
      .then((response) => {
        const userAlbumInfo: UserAlbumInfo = UserAlbumInfoSchema.parse(response.data);
        dispatch({
          type: "SET_ALBUM_USER_SHARED_FULFILLED",
          payload: userAlbumInfo,
        });
        dispatch(fetchUserAlbum(album_id));

        if (val_shared) {
          dispatch(
            notify({
              message: `Album was successfully shared`,
              title: "Share album",
              status: "success",
              dismissible: true,
              dismissAfter: 3000,
              position: "br",
            })
          );
        } else {
          dispatch(
            notify({
              message: `Album was successfully unshared`,
              title: "Unshare album",
              status: "success",
              dismissible: true,
              dismissAfter: 3000,
              position: "br",
            })
          );
        }
      })
      .catch((err) => {
        dispatch({ type: "SET_ALBUM_USER_SHARED_FULFILLED", payload: err });
        console.log(err.content);
      });
  };
}

//sharing
const _FetchUserAlbumsSharedResponseSchema = z.object({ results: UserAlbumInfoSchema.array() })
export function fetchUserAlbumsSharedToMe() {
  return function (dispatch: Dispatch<any>) {
    dispatch({ type: "FETCH_ALBUMS_SHARED_TO_ME" });
    Server.get("/albums/user/shared/tome/")
      .then((response) => {
        const data = _FetchUserAlbumsSharedResponseSchema.parse(response.data);
        const userAlbumInfoList: UserAlbumInfo[] = data.results;
        const sharedAlbumsGroupedByOwner = _.toPairs(
          _.groupBy(userAlbumInfoList, "owner.id")
        ).map((el) => {
          return { user_id: parseInt(el[0], 10), albums: el[1] };
        });
        dispatch({
          type: "FETCH_ALBUMS_SHARED_TO_ME_FULFILLED",
          payload: sharedAlbumsGroupedByOwner,
        });
      })
      .catch((err) => {
        dispatch({ type: "FETCH_ALBUMS_SHARED_TO_ME_REJECTED", payload: err });
      });
  };
}

export function fetchUserAlbumsSharedFromMe() {
  return function (dispatch: Dispatch<any>) {
    dispatch({ type: "FETCH_ALBUMS_SHARED_FROM_ME" });
    Server.get("/albums/user/shared/fromme/")
      .then((response) => {
        const data = _FetchUserAlbumsSharedResponseSchema.parse(response.data);
        const userAlbumInfoList: UserAlbumInfo[] = data.results;
        dispatch({
          type: "FETCH_ALBUMS_SHARED_FROM_ME_FULFILLED",
          payload: userAlbumInfoList,
        });
      })
      .catch((err) => {
        dispatch({
          type: "FETCH_ALBUMS_SHARED_FROM_ME_REJECTED",
          payload: err,
        });
      });
  };
}

export type AlbumsAction =
  | FetchDateAlbumsListAction
  | FetchDateAlbumsRetrieveAction
  | FetchPersonPhotosAction
  | FetchUserAlbumAction