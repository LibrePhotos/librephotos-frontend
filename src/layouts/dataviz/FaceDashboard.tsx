/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
import { Stack } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { AutoSizer, Grid } from "react-virtualized";

import { deleteFaces, fetchInferredFacesList, fetchLabeledFacesList } from "../../actions/facesActions";
import { ButtonHeaderGroup } from "../../components/facedashboard/ButtonHeaderGroup";
import { FaceComponent } from "../../components/facedashboard/FaceComponent";
import { HeaderComponent } from "../../components/facedashboard/HeaderComponent";
import { TabComponent } from "../../components/facedashboard/TabComponent";
import { ModalPersonEdit } from "../../components/modals/ModalPersonEdit";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { calculateFaceGridCellSize, calculateFaceGridCells } from "../../util/gridUtils";
import { FACES_LABELED } from "./constants";

export function FaceDashboard() {
  const { ref, width } = useElementSize();
  const [lastChecked, setLastChecked] = useState(null);
  const [activeItem, setActiveItem] = useState(FACES_LABELED);
  const [entrySquareSize, setEntrySquareSize] = useState(200);
  const [numEntrySquaresPerRow, setNumEntrySquaresPerRow] = useState(10);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedFaces, setSelectedFaces] = useState<any[]>([]);
  const [modalPersonEditOpen, setModalPersonEditOpen] = useState(false);

  const [inferredCellContents, setInferredCellContents] = useState<any[]>([]);
  const [labeledCellContents, setLabeledCellContents] = useState<any[]>([]);
  const [inferredGroupedByPersonList, setInferredGroupedByPersonList] = useState<any[]>([]);
  const [labeledGroupedByPersonList, setLabeledGroupedByPersonList] = useState<any[]>([]);

  const { inferredFacesList, labeledFacesList, fetchingLabeledFacesList, fetchingInferredFacesList } = useAppSelector(
    store => store.faces,
    (prev, next) =>
      prev.inferredFacesList === next.inferredFacesList &&
      prev.labeledFacesList === next.labeledFacesList &&
      prev.fetchingLabeledFacesList === next.fetchingLabeledFacesList &&
      prev.fetchingInferredFacesList === next.fetchingInferredFacesList
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchInferredFacesList());
    dispatch(fetchLabeledFacesList());
  }, [dispatch]);

  useEffect(() => {
    const inferredAndGroupedByPerson = _.groupBy(inferredFacesList, el => el.person_name);
    const inferredAndGroupedByPersonList = _.sortBy(_.toPairsIn(inferredAndGroupedByPerson), el => el[0]).map(el => ({
      person_name: el[0],
      faces: _.reverse(_.sortBy(el[1], el2 => el2.person_label_probability)),
    }));

    const labeledAndGroupedByPerson = _.groupBy(labeledFacesList, el => el.person_name);
    const labeledAndGroupedByPersonList = _.sortBy(_.toPairsIn(labeledAndGroupedByPerson), el => el[0]).map(el => ({
      person_name: el[0],
      faces: el[1],
    }));
    const inferredFaceGridCells = calculateFaceGridCells(
      inferredAndGroupedByPersonList,
      numEntrySquaresPerRow
    ).cellContents;
    const labeledFaceGridCells = calculateFaceGridCells(
      labeledAndGroupedByPersonList,
      numEntrySquaresPerRow
    ).cellContents;
    setInferredCellContents(inferredFaceGridCells);
    setLabeledCellContents(labeledFaceGridCells);
    setInferredGroupedByPersonList(inferredAndGroupedByPersonList);
    setLabeledGroupedByPersonList(labeledAndGroupedByPersonList);
  }, [inferredFacesList, labeledFacesList, selectedFaces, numEntrySquaresPerRow]);

  useEffect(() => {
    const faceGridCellSize = calculateFaceGridCellSize(width);
    const numPerRow = faceGridCellSize.numEntrySquaresPerRow;
    const squareSize = faceGridCellSize.entrySquareSize;

    setEntrySquareSize(squareSize);
    setNumEntrySquaresPerRow(numPerRow);

    if (inferredGroupedByPersonList) {
      const inferredFaceGridCells = calculateFaceGridCells(inferredGroupedByPersonList, numPerRow).cellContents;
      setInferredCellContents(inferredFaceGridCells);
    }
    if (labeledGroupedByPersonList) {
      const labeledFaceGridCells = calculateFaceGridCells(labeledGroupedByPersonList, numPerRow).cellContents;
      setLabeledCellContents(labeledFaceGridCells);
    }
  }, [inferredGroupedByPersonList, labeledGroupedByPersonList, selectedFaces, width]);

  const onFacesSelect = faces => {
    // get duplicates of new faces and selected faces
    const duplicates = faces.filter(face => selectedFaces.find(i => i.face_id === face.face_id));
    // merge selected faces with new faces, filter both duplicates
    const merged = _.uniqBy([...selectedFaces, ...faces], el => el.face_id);
    // filter duplicates from new faces
    const mergedAndFiltered = merged.filter(face => !duplicates.find(i => i.face_id === face.face_id));
    // add the last selected face back to the start of the list when adding new faces
    // @ts-ignore
    const lastSelectedFace = { face_id: lastChecked.id, face_url: lastChecked.face_url };
    const mergedAndFilteredAndLastSelected =
      duplicates.length !== faces.length ? [lastSelectedFace, ...mergedAndFiltered] : mergedAndFiltered;
    setSelectedFaces(mergedAndFilteredAndLastSelected);
    setSelectMode(true);
  };

  const onFaceSelect = face => {
    let tempSelectedFaces = selectedFaces;
    if (tempSelectedFaces.map(f => f.face_id).includes(face.face_id)) {
      tempSelectedFaces = tempSelectedFaces.filter(item => item.face_id !== face.face_id);
    } else {
      tempSelectedFaces.push(face);
    }
    setSelectedFaces(tempSelectedFaces);
    setSelectMode(tempSelectedFaces.length > 0);
  };

  const handleClick = (e, cell) => {
    if (!lastChecked) {
      setLastChecked(cell);
      onFaceSelect({ face_id: cell.id, face_url: cell.face_url });
      return;
    }
    if (e.shiftKey) {
      const currentCellsInRowFormat = activeItem === FACES_LABELED ? labeledCellContents : inferredCellContents;

      const allFacesInCells = [] as any[];
      for (let i = 0; i < currentCellsInRowFormat.length; i++) {
        for (let j = 0; j < numEntrySquaresPerRow; j++) {
          allFacesInCells.push(currentCellsInRowFormat[i][j]);
        }
      }
      const start = allFacesInCells.indexOf(cell);
      const end = allFacesInCells.indexOf(lastChecked);

      const facesToSelect = allFacesInCells
        .slice(Math.min(start, end), Math.max(start, end) + 1)
        .filter(i => i && i.id);
      onFacesSelect(facesToSelect.map(i => ({ face_id: i.id, face_url: i.face_url })));
      setLastChecked(cell);
      return;
    }
    onFaceSelect({ face_id: cell.id, face_url: cell.face_url });
    setLastChecked(cell);
  };

  const changeSelectMode = () => {
    if (selectMode) {
      setSelectedFaces([]);
    }
    setSelectMode(!selectMode);
  };

  const deleteSelectedFaces = () => {
    if (selectedFaces.length > 0) {
      const ids = selectedFaces.map(face => face.face_id);
      dispatch(deleteFaces(ids));
      setSelectedFaces([]);
      setSelectMode(false);
    }
  };

  const addFaces = () => {
    if (selectedFaces.length > 0) {
      setModalPersonEditOpen(true);
    }
  };

  const cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    let cell;
    if (activeItem === FACES_LABELED) {
      cell = labeledCellContents[rowIndex][columnIndex];
    } else {
      cell = inferredCellContents[rowIndex][columnIndex];
    }

    if (cell) {
      if (!cell.image) {
        return <HeaderComponent key={key} style={style} width={width} cell={cell} entrySquareSize={entrySquareSize} />;
      }
      return (
        <div key={key} style={style}>
          <FaceComponent
            handleClick={handleClick}
            cell={cell}
            isScrollingFast={false}
            selectMode={selectMode}
            isSelected={selectedFaces.map(face => face.face_id).includes(cell.id)}
            activeItem={activeItem}
            entrySquareSize={entrySquareSize}
          />
        </div>
      );
    }
    return <div key={key} style={style} />;
  };

  return (
    <div style={{ display: "flex", flexFlow: "column", height: "100%" }}>
      <Stack>
        <TabComponent
          onTabChange={setActiveItem}
          width={width}
          fetchingLabeledFacesList={fetchingLabeledFacesList}
          fetchingInferredFacesList={fetchingInferredFacesList}
        />
        <ButtonHeaderGroup
          selectMode={selectMode}
          selectedFaces={selectedFaces}
          changeSelectMode={changeSelectMode}
          addFaces={addFaces}
          deleteFaces={deleteSelectedFaces}
        />
      </Stack>
      <div ref={ref} style={{ flexGrow: 1 }}>
        <AutoSizer>
          {(
            { height, width } // eslint-disable-line
          ) => (
            <Grid
              style={{ overflowX: "hidden" }}
              disableHeader={false}
              cellRenderer={cellRenderer}
              columnWidth={entrySquareSize}
              columnCount={numEntrySquaresPerRow}
              rowHeight={entrySquareSize}
              height={height}
              width={width}
              rowCount={activeItem === FACES_LABELED ? labeledCellContents.length : inferredCellContents.length}
            />
          )}
        </AutoSizer>
      </div>
      <ModalPersonEdit
        isOpen={modalPersonEditOpen}
        onRequestClose={() => {
          setModalPersonEditOpen(false);
          setSelectedFaces([]);
          setSelectMode(false);
        }}
        selectedFaces={selectedFaces}
      />
    </div>
  );
}
