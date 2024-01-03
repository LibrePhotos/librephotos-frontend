import { peopleAlbumsApi } from "../api_client/albums/people";
import { Server } from "../api_client/apiClient";
import { notification } from "../service/notifications";
import { PersonDataPointList } from "./peopleActions.types";

export function setAlbumCoverForPerson(person_id, photo_hash) {
  return function cb(dispatch) {
    dispatch({ type: "SET_ALBUM_COVER_FOR_PERSON" });
    Server.patch(`persons/${person_id}/`, {
      cover_photo: photo_hash,
    })
      .then(() => {
        // To-Do: I should do something with the response
        dispatch({ type: "SET_ALBUM_COVER_FOR_PERSON_FULFILLED" });
        notification.setCoverPhoto();
        dispatch(peopleAlbumsApi.endpoints.fetchPeopleAlbums.initiate());
      })
      .catch(payload => {
        dispatch({ type: "SET_ALBUM_COVER_FOR_PERSON_REJECTED", payload });
      });
  };
}

export function fetchSocialGraph(dispatch) {
  dispatch({ type: "FETCH_SOCIAL_GRAPH" });
  Server.get("socialgraph")
    .then(response => {
      const payload = PersonDataPointList.parse(response.data);
      dispatch({
        type: "FETCH_SOCIAL_GRAPH_FULFILLED",
        payload,
      });
    })
    .catch(payload => {
      dispatch({ type: "FETCH_SOCIAL_GRAPH_REJECTED", payload });
    });
}
