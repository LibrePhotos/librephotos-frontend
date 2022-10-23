import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { api } from "../../api_client/api";
import type { ICompletePersonFace, ICompletePersonFaceList, IFacesState, IPersonFace } from "./facesActions.types";

const initialState: IFacesState = {
  labeledFacesList: [] as ICompletePersonFaceList[],
  inferredFacesList: [] as ICompletePersonFaceList[],
  facesVis: [],
  training: false,
  trained: false,
  clustering: false,
  clustered: false,
  error: null,
};

const compareFacesConfidence = (a: IPersonFace, b: IPersonFace) => {
  if (a.person_label_probability > b.person_label_probability)
    return -1;
  if (a.person_label_probability < b.person_label_probability)
    return 1;
  if (a.id < b.id)
    return -1;
  if (a.id > b.id)
    return 1;
  return 0;
};

const compareFacesDate = (a: IPersonFace, b: IPersonFace) => {
  const dateA = new Date(a.timestamp || '');
  const dateB = new Date(b.timestamp || '');
  if (dateA.toString() === "Invalid Date" && dateB.toString() === "Invalid Date")
    return compareFacesConfidence(a, b);             
  if (dateA.toString() === "Invalid Date")
    return 1;
  if (dateB.toString() === "Invalid Date")
    return -1;
  if (dateA < dateB)
    return -1;
  if (dateA > dateB)
    return 1;
  return compareFacesConfidence(a, b);
};

const sortFaces = (faces, orderBy: string = "confidence") => {
  if (orderBy === "confidence") {
    faces.sort((a: IPersonFace, b: IPersonFace) => compareFacesConfidence(a, b));
  } else if (orderBy === "date") {
    faces.sort((a: IPersonFace, b: IPersonFace) => compareFacesDate(a, b));
  }
};

const sortGroupsByName = (list: any) => {
  //@ts-ignore
  list.sort((a, b) => {
    // Place Unknown groups at the end of the list  
    if (a.kind === "UNKNOWN" && b.kind !== "UNKNOWN")
      return 1;
    if (a.kind !== "UNKNOWN" && b.kind === "UNKNOWN")
      return -1;
    if (a.name.toLowerCase() < b.name.toLowerCase())
      return -1;
    if (a.name.toLowerCase() > b.name.toLowerCase())
      return 1;
    return 0;    
  });
};

const faceSlice = createSlice({
  name: "face",
  initialState: initialState,
  reducers: {
    changeFaceOrderBy(state, action: PayloadAction<string>) {
      const orderBy = action.payload;
      // @ts-ignore
      state.labeledFacesList.forEach(group => {sortFaces(group.faces, orderBy)});
      // @ts-ignore
      state.inferredFacesList.forEach(group => {sortFaces(group.faces, orderBy)});
    },
  },
  extraReducers: builder => {
    builder
      //@ts-ignore
      .addMatcher(api.endpoints.fetchIncompleteFaces.matchFulfilled, (state, { meta, payload }) => {
        const newFacesList: ICompletePersonFaceList = payload.map(person => {
          const completePersonFace: ICompletePersonFace = { ...person, faces: [] };
          for (let i = 0; i < person.face_count; i++) {
            completePersonFace.faces.push({
              id: i,
              image: null,
              face_url: null,
              photo: "",
              person_label_probability: 1,
              person: person.id,
              isTemp: true,
            });
          }
          return completePersonFace;
        });
        // sort both lists by name
        sortGroupsByName(newFacesList);
        return {
          ...state,
          labeledFacesList: !meta.arg.originalArgs.inferred ? newFacesList : state.labeledFacesList,
          inferredFacesList: meta.arg.originalArgs.inferred ? newFacesList : state.inferredFacesList,
        };
      })
      .addMatcher(api.endpoints.fetchFaces.matchFulfilled, (state, { meta, payload }) => {
        const inferred = meta.arg.originalArgs.inferred;
        var personListToChange = inferred ? state.inferredFacesList : state.labeledFacesList;
        const personId = meta.arg.originalArgs.person;
        //@ts-ignore
        const indexToReplace = personListToChange.findIndex(person => person.id === personId);
        // To-Do need to check why the person might not be found in the list
        if (indexToReplace !== -1) {
          const personToChange = personListToChange[indexToReplace];
          //@ts-ignore
          const currentFaces = personToChange.faces;
          //@ts-ignore
          const newFaces = payload.results;

          const updatedFaces = currentFaces
            .slice(0, (meta.arg.originalArgs.page - 1) * 100)
            .concat(newFaces)
            .concat(currentFaces.slice(meta.arg.originalArgs.page * 100));

          //@ts-ignore
          personToChange.faces = updatedFaces;
          //@ts-ignore
          sortFaces(personToChange.faces, meta.arg.originalArgs.orderBy);
          personListToChange[indexToReplace] = personToChange;
        }
      })
      //@ts-ignore
      .addMatcher(api.endpoints.clusterFaces.matchFulfilled, (state, { payload }) => {
        return {
          ...state,
          facesVis: payload,
          clustered: true,
        };
      })
      //@ts-ignore
      .addMatcher(api.endpoints.trainFaces.matchFulfilled, (state, { payload }) => {
        return {
          ...state,
          training: false,
          trained: true,
          facesVis: payload,
        };
      })
      .addMatcher(api.endpoints.deleteFaces.matchFulfilled, (state, { meta, payload }) => {
        const facesToRemove = payload.results;
        const newLabeledFacesList = state.labeledFacesList;
        const newInferredFacesList = state.inferredFacesList;
        facesToRemove.forEach(face => {
          // find the person by finding the face and remove the face from it and update the list
          const personToChange = newLabeledFacesList.find(
            //@ts-ignore
            person => person.faces.filter(i => i.face_url == face).length > 0
          );
          if (personToChange) {
            //@ts-ignore
            const indexToRemove = personToChange.faces.findIndex(f => f.face_url === face);
            //@ts-ignore
            personToChange.faces.splice(indexToRemove, 1);
            //@ts-ignore
            const indexToReplace = newLabeledFacesList.findIndex(person => person.id === personToChange.id);
            //@ts-ignore
            if (personToChange.faces.length === 0) {
              newLabeledFacesList.splice(indexToReplace, 1);
            } else {
              newLabeledFacesList[indexToReplace] = personToChange;
            }
          }
          // same thing for inferred
          const personToChangeInferred = newInferredFacesList.find(
            //@ts-ignore
            person => person.faces.filter(i => i.face_url == face).length > 0
          );
          if (personToChangeInferred) {
            //@ts-ignore
            const indexToRemoveInferred = personToChangeInferred.faces.findIndex(f => f.face_url === face);
            //@ts-ignore
            personToChangeInferred.faces.splice(indexToRemoveInferred, 1);
            const indexToReplaceInferred = newInferredFacesList.findIndex(
              //@ts-ignore
              person => person.id === personToChangeInferred.id
            );
            //@ts-ignore
            if (personToChangeInferred.faces.length === 0) {
              newInferredFacesList.splice(indexToReplaceInferred, 1);
            } else {
              newInferredFacesList[indexToReplaceInferred] = personToChangeInferred;
            }
          }
        });
      })
      .addMatcher(api.endpoints.setFacesPersonLabel.matchFulfilled, (state, { meta, payload }) => {
        const facesToRemove = payload.results;
        const facesToAdd = payload.results;
        const newLabeledFacesList = state.labeledFacesList;
        const newInferredFacesList = state.inferredFacesList;
        facesToRemove.forEach(face => {
          // find the person by finding the face and remove the face from it and update the list
          const personToChange = newLabeledFacesList.find(
            //@ts-ignore
            person => person.faces.filter(i => i.face_url == face.face_url).length > 0
          );
          if (personToChange) {
            //@ts-ignore
            const indexToRemove = personToChange.faces.findIndex(f => f.id === face.id);
            //@ts-ignore
            personToChange.faces.splice(indexToRemove, 1);
            //@ts-ignore
            const indexToReplace = newLabeledFacesList.findIndex(person => person.id === personToChange.id);
            //@ts-ignore
            if (personToChange.faces.length === 0) {
              newLabeledFacesList.splice(indexToReplace, 1);
            } else {
              newLabeledFacesList[indexToReplace] = personToChange;
            }
          }
          // same thing for inferred
          const personToChangeInferred = newInferredFacesList.find(
            //@ts-ignore
            person => person.faces.filter(i => i.face_url == face.face_url).length > 0
          );
          if (personToChangeInferred) {
            //@ts-ignore
            const indexToRemoveInferred = personToChangeInferred.faces.findIndex(f => f.id === face.id);
            //@ts-ignore
            personToChangeInferred.faces.splice(indexToRemoveInferred, 1);
            const indexToReplaceInferred = newInferredFacesList.findIndex(
              //@ts-ignore
              person => person.id === personToChangeInferred.id
            );
            //@ts-ignore
            if (personToChangeInferred.faces.length === 0) {
              newInferredFacesList.splice(indexToReplaceInferred, 1);
            } else {
              newInferredFacesList[indexToReplaceInferred] = personToChangeInferred;
            }
          }
        });

        facesToAdd.forEach(face => {
          // find the person and add the face to it and update the list
          //@ts-ignore
          const personToChange = newLabeledFacesList.find(person => person.id === face.person);
          if (personToChange) {
            //@ts-ignore
            personToChange.faces.push(face);
            //@ts-ignore
            const indexToReplace = newLabeledFacesList.findIndex(person => person.id === face.person);
            newLabeledFacesList[indexToReplace] = personToChange;
          } else {
            // add new person and new face
            const newPerson = {
              id: face.person,
              name: face.person_name,
              faces: [
                {
                  id: face.id,
                  //@ts-ignore
                  face_url: face.face_url,
                  image: face.image,
                  person_label_probability: 1,
                  photo: face.photo,
                },
              ],
            };
            //@ts-ignore
            newLabeledFacesList.push(newPerson);
          }
        });

        // sort both lists by name
        sortGroupsByName(newLabeledFacesList);
        sortGroupsByName(newInferredFacesList);
        // @ts-ignore
        state.labeledFacesList.forEach(group => {sortFaces(group.faces, meta.arg.originalArgs.orderBy)});
        // @ts-ignore
        state.inferredFacesList.forEach(group => {sortFaces(group.faces, meta.arg.originalArgs.orderBy)});
      })
      .addDefaultCase(state => state);
  },
});

export const { reducer: faceReducer, actions: faceActions } = faceSlice;
