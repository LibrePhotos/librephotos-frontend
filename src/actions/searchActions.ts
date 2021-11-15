import { Server } from "../api_client/apiClient";
import _ from "lodash";
import { adjustDateFormat, getPhotosFlatFromGroupedByDate } from "../util/util";
import { Dispatch } from "react";
import { DatePhotosGroup, DatePhotosGroupSchema, PersonInfo, PigPhoto } from "./photosActions.types";
import { AlbumInfo, AlbumInfoSchema, Person, PersonSchema, PlaceAlbumInfo, PlaceAlbumInfoSchema } from "./albumsActions";
import { z } from "zod";

export type SearchEmptyQueryErrorAction = { type: "SEARCH_EMPTY_QUERY_ERROR" }

const SearchPhotosResponseSchema = z.object({ results: DatePhotosGroupSchema.array() })
export type SearchPhotosAction =
  | { type: "SEARCH_PHOTOS", payload: string }
  | { type: "SEARCH_PHOTOS_FULFILLED", payload: { photosFlat: PigPhoto[], photosGroupedByDate: DatePhotosGroup[] } }
  | { type: "SEARCH_PHOTOS_REJECTED", payload: string }
export function searchPhotos(query: string) {
  return function (dispatch: Dispatch<SearchPhotosAction | SearchEmptyQueryErrorAction>) {
    if (query.trim().length === 0) {
      dispatch({ type: "SEARCH_EMPTY_QUERY_ERROR" });
    } else {
      dispatch({ type: "SEARCH_PHOTOS", payload: query });
      Server.get(`photos/searchlist/?search=${query}`, { timeout: 100000 })
        .then((response) => {
          let data = SearchPhotosResponseSchema.parse(response.data);
          var photosGroupedByDate: DatePhotosGroup[] = data.results;
          adjustDateFormat(photosGroupedByDate);
          dispatch({
            type: "SEARCH_PHOTOS_FULFILLED",
            payload: {
              photosFlat: getPhotosFlatFromGroupedByDate(photosGroupedByDate),
              photosGroupedByDate: photosGroupedByDate,
            },
          });
        })
        .catch((err) => {
          dispatch({ type: "SEARCH_PHOTOS_REJECTED", payload: err });
        });
    }
  };
}

interface MappedPeopleDropdownOption {
  key: number,
  value: string,
  text: string,
  face_url: string,
  face_count: number,
  face_photo_url: string,
}
const SearchPeopleResponseSchema = z.object({ results: PersonSchema.array() })
export type SearchPeopleAction =
  | { type: "SEARCH_PEOPLE" }
  | { type: "SEARCH_PEOPLE_FULFILLED", payload: MappedPeopleDropdownOption[] }
  | { type: "SEARCH_PEOPLE_REJECTED", payload: string }
export function searchPeople(query: string) {
  return function (dispatch: Dispatch<SearchPeopleAction | SearchEmptyQueryErrorAction>) {
    if (query.trim().length === 0) {
      dispatch({ type: "SEARCH_EMPTY_QUERY_ERROR" });
    } else {
      var url = `persons/?search=${query}`;
      dispatch({ type: "SEARCH_PEOPLE" });
      Server.get(url)
        .then((response) => {
          let data = SearchPeopleResponseSchema.parse(response.data);
          var mappedPeopleDropdownOptions: MappedPeopleDropdownOption[] = data.results.map(function (
            person: Person
          ) {
            return {
              key: person.id,
              value: person.name,
              text: person.name,
              face_url: person.face_url,
              face_count: person.face_count,
              face_photo_url: person.face_photo_url,
            };
          });
          dispatch({
            type: "SEARCH_PEOPLE_FULFILLED",
            payload: mappedPeopleDropdownOptions,
          });
        })
        .catch((err) => {
          dispatch({ type: "SEARCH_PEOPLE_REJECTED", payload: err });
        });
    }
  };
}

const SearchThingAlbumsResponseSchema = z.object({ results: AlbumInfoSchema.array() })
export type SearchThingAlbumsAction =
  | { type: "SEARCH_THING_ALBUMS" }
  | { type: "SEARCH_THING_ALBUMS_FULFILLED", payload: AlbumInfo[] }
  | { type: "SEARCH_THING_ALBUMS_REJECTED", payload: string }
export function searchThingAlbums(query: string) {
  return function (dispatch: Dispatch<SearchThingAlbumsAction>) {
    dispatch({ type: "SEARCH_THING_ALBUMS" });
    Server.get(`albums/thing/list/?search=${query}`)
      .then((response) => {
        let data = SearchThingAlbumsResponseSchema.parse(response.data);
        let albums: AlbumInfo[] = data.results;
        dispatch({
          type: "SEARCH_THING_ALBUMS_FULFILLED",
          payload: albums,
        });
      })
      .catch((err) => {
        dispatch({ type: "SEARCH_THING_ALBUMS_REJECTED", payload: err });
      });
  };
}

const SearchPlaceAlbumsResponseSchema = z.object({results: PlaceAlbumInfoSchema.array()})
export type SearchPlaceAlbumsAction =
  | { type: "SEARCH_PLACE_ALBUMS"}
  | { type: "SEARCH_PLACE_ALBUMS_FULFILLED", payload: PlaceAlbumInfo[]}
export function searchPlaceAlbums(query: string) {
  return function (dispatch: Dispatch<any>) {
    dispatch({ type: "SEARCH_PLACE_ALBUMS" });
    Server.get(`albums/place/list/?search=${query}`)
      .then((response) => {
        let data = SearchPlaceAlbumsResponseSchema.parse(response.data);
        let albums: PlaceAlbumInfo[] = data.results;
        dispatch({
          type: "SEARCH_PLACE_ALBUMS_FULFILLED",
          payload: albums,
        });
      })
      .catch((err) => {
        dispatch({ type: "SEARCH_PLACE_ALBUMS_REJECTED", payload: err });
      });
  };
}
