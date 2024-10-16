/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
import { Stack } from "@mantine/core";
import { useElementSize, useScrollLock } from "@mantine/hooks";
import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { AutoSizer, Grid } from "react-virtualized";

import { api, useFetchFacesQuery, useFetchIncompleteFacesQuery } from "../../api_client/api";
import { photoDetailsApi } from "../../api_client/photos/photoDetail";
import { ButtonHeaderGroup } from "../../components/facedashboard/ButtonHeaderGroup";
import { FaceComponent } from "../../components/facedashboard/FaceComponent";
import { HeaderComponent } from "../../components/facedashboard/HeaderComponent";
import { TabComponent } from "../../components/facedashboard/TabComponent";
import { LightBox } from "../../components/lightbox/LightBox";
import { ModalPersonEdit } from "../../components/modals/ModalPersonEdit";
import { ScrollScrubber } from "../../components/scrollscrubber/ScrollScrubber";
import { ScrollerType } from "../../components/scrollscrubber/ScrollScrubberTypes.zod";
import type { IScrollerData } from "../../components/scrollscrubber/ScrollScrubberTypes.zod";
import { notification } from "../../service/notifications";
import { faceActions } from "../../store/faces/faceSlice";
import { FacesTab } from "../../store/faces/facesActions.types";
import { FaceAnalysisMethod } from "../../store/faces/facesActions.types";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { calculateFaceGridCellSize, calculateFaceGridCells } from "../../util/gridUtils";

export function FaceDashboard() {
  const { ref, width } = useElementSize();
  const gridRef = useRef<any>();

  const { activeTab, tabs, analysisMethod } = useAppSelector(store => store.face);

  const [lastChecked, setLastChecked] = useState(null);
  const [selectedFaces, setSelectedFaces] = useState<any[]>([]);
  const [modalPersonEditOpen, setModalPersonEditOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(1);
  const [lightboxImageId, setLightboxImageId] = useState("");
  const [lightboxShow, setLightboxShow] = useState(false);

  const [scrollTo, setScrollTo] = useState<number | null>(null);
  const setScrollLocked = useScrollLock(false)[1];
  const { orderBy } = useAppSelector(store => store.face);

  const { data: labeledFacesList = [], isFetching: fetchingInferredFacesList } = useFetchIncompleteFacesQuery({
    inferred: false,
    orderBy: orderBy,
  });

  const { data: inferredFacesList = [], isFetching: fetchingLabeledFacesList } = useFetchIncompleteFacesQuery({
    inferred: true,
    method: analysisMethod,
    orderBy: orderBy,
  });
  // To-Do: For saninty, we should use the same data flow for unknown faces as we do for labeled and inferred faces
  const { data: unknownFacesList = [], isFetching: fetchingUnknownFacesList } = useFetchFacesQuery({
    person: "None",
    page: 1,
    method: analysisMethod,
    orderBy: "confidence",
  });
  const dispatch = useAppDispatch();

  const [groups, setGroups] = useState<
    {
      page: number;
      person: any;
      inferred: boolean;
      method: FaceAnalysisMethod;
    }[]
  >([]);

  const { entrySquareSize, numEntrySquaresPerRow } = calculateFaceGridCellSize(width);

  const inferredCellContents = calculateFaceGridCells(inferredFacesList, numEntrySquaresPerRow).cellContents;
  const labeledCellContents = calculateFaceGridCells(labeledFacesList, numEntrySquaresPerRow).cellContents;
  const unknownCellContents = calculateFaceGridCells(unknownFacesList, numEntrySquaresPerRow).cellContents;

  const selectMode = selectedFaces.length > 0;

  const getPhotoDetails = (image: string) => {
    dispatch(photoDetailsApi.endpoints.fetchPhotoDetails.initiate(image));
  };

  let idx2hash: { id: string }[] = [];

  switch (activeTab) {
    case FacesTab.enum.labeled:
      idx2hash = labeledFacesList.flatMap(person => person.faces).map(face => ({ id: face.photo }));
      break;
    case FacesTab.enum.inferred:
      idx2hash = inferredFacesList.flatMap(person => person.faces).map(face => ({ id: face.photo }));
      break;
    case FacesTab.enum.unknown:
      idx2hash = unknownFacesList.flatMap(person => person.faces).map(face => ({ id: face.photo }));
      break;
    default:
      [];
  }

  const handleShowClick = (event: React.KeyboardEvent, item: any) => {
    const index = idx2hash.findIndex(image => image.id === item.photo);
    setLightboxImageIndex(index);
    setLightboxImageId(item.photo);
    setLightboxShow(index >= 0);
    setScrollLocked(true);
  };

  groups.forEach(element => {
    dispatch(
      api.endpoints.fetchFaces.initiate({
        person: element.person ? element.person : "None",
        page: element.page,
        inferred: element.inferred,
        orderBy,
        method: element.inferred ? element.method : undefined,
      })
    );
  });

  const handleGridScroll = (params: any) => {
    const { scrollTop } = params;
    if (scrollTo !== null && scrollTop === scrollTo) {
      setScrollTo(null);
    }
    if (tabs[activeTab].scrollPosition !== scrollTop) {
      dispatch(
        faceActions.saveCurrentGridPosition({
          tab: activeTab,
          position: scrollTop,
        })
      );
    }
  };

  const getScrollPositions = () => {
    const cellContents =
      activeTab === FacesTab.enum.labeled
        ? labeledCellContents
        : activeTab === FacesTab.Enum.inferred
          ? inferredCellContents
          : unknownCellContents;
    let scrollPosition = 0;
    const scrollPositions: IScrollerData[] = [];
    cellContents.forEach(row => {
      if (row[0].name) {
        scrollPositions.push({ label: row[0].name, targetY: scrollPosition });
      }
      scrollPosition += entrySquareSize;
    });
    return scrollPositions;
  };

  const dataForScrollIndicator = getScrollPositions();

  useEffect(() => {
    setScrollTo(tabs[activeTab].scrollPosition);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [activeTab]);

  useEffect(() => {
    if (scrollTo !== null) {
      dispatch(
        faceActions.saveCurrentGridPosition({
          tab: activeTab,
          position: scrollTo,
        })
      );
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [scrollTo]);

  // ensure that the endpoint is not undefined
  const getEndpointCell = (cellContents, rowStopIndex, columnStopIndex) => {
    if (cellContents[rowStopIndex][columnStopIndex]) {
      return cellContents[rowStopIndex][columnStopIndex];
    }
    return getEndpointCell(cellContents, rowStopIndex, columnStopIndex - 1);
  };

  const gridHeight = gridRef.current ? gridRef.current.getTotalRowsHeight() : 200;

  const onSectionRendered = (params: any) => {
    const cellContents =
      activeTab === FacesTab.enum.labeled
        ? labeledCellContents
        : activeTab === FacesTab.Enum.inferred
          ? inferredCellContents
          : unknownCellContents;
    const startPoint = cellContents[params.rowOverscanStartIndex][params.columnOverscanStartIndex];
    const endPoint = getEndpointCell(cellContents, params.rowOverscanStopIndex, params.columnOverscanStopIndex);
    // flatten labeledCellContents and find the range of cells that are in the viewport
    const flatCellContents = _.flatten(cellContents);
    const startIndex = flatCellContents.findIndex(cell => JSON.stringify(cell) === JSON.stringify(startPoint));
    const endIndex = flatCellContents.findIndex(cell => JSON.stringify(cell) === JSON.stringify(endPoint));

    // get the range of cells that are in the viewport
    const visibleCells = flatCellContents.slice(startIndex, endIndex + 1);
    const relevantInfos = visibleCells
      .filter((i: any) => i.isTemp)
      .map((i: any) => {
        const page = Math.ceil((parseInt(i.id, 10) + 1) / 100);
        return {
          page,
          person: activeTab === FacesTab.enum.unknown ? "" : i.person,
          // To-Do: this is also dumb
          inferred: !(activeTab === FacesTab.enum.labeled || activeTab === FacesTab.enum.unknown),
          method: analysisMethod,
        };
      });
    const uniqueGroups = _.uniqBy(relevantInfos, (e: any) => `${e.page} ${e.person}`);
    if (uniqueGroups.length > 0) {
      setGroups(uniqueGroups);
    } else {
      setGroups([]);
    }
  };

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
  };

  const onFaceSelect = face => {
    let tempSelectedFaces = selectedFaces;
    if (tempSelectedFaces.map(f => f.face_url).includes(face.face_url)) {
      tempSelectedFaces = tempSelectedFaces.filter(item => item.face_url !== face.face_url);
    } else {
      tempSelectedFaces.push(face);
    }
    setSelectedFaces([...tempSelectedFaces]);
  };

  const handleClick = (e, cell) => {
    if (!lastChecked) {
      setLastChecked(cell);
      onFaceSelect({ face_id: cell.id, face_url: cell.face_url });
      return;
    }
    if (e.shiftKey) {
      const currentCellsInRowFormat =
        activeTab === FacesTab.enum.labeled
          ? labeledCellContents
          : activeTab === FacesTab.Enum.inferred
            ? inferredCellContents
            : unknownCellContents;
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
        .filter(i => i && i.image);
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
  };

  const deleteSelectedFaces = () => {
    if (selectedFaces.length > 0) {
      const ids = selectedFaces.map(face => face.face_id);
      dispatch(api.endpoints.deleteFaces.initiate({ faceIds: ids }));
      notification.deleteFaces(ids.length);
      setSelectedFaces([]);
    }
  };

  const addFaces = () => {
    if (selectedFaces.length > 0) {
      setModalPersonEditOpen(true);
    }
  };

  const notThisPersonFunc = () => {
    if (selectedFaces.length > 0) {
      const ids = selectedFaces.map(face => face.face_id);
      dispatch(api.endpoints.setFacesPersonLabel.initiate({ faceIds: ids, personName: "Unknown - Other" }));
      notification.removeFacesFromPerson(ids.length);
      setSelectedFaces([]);
    }
  };

  const cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const cell =
      activeTab === FacesTab.enum.labeled
        ? labeledCellContents[rowIndex][columnIndex]
        : activeTab === FacesTab.Enum.inferred
          ? inferredCellContents[rowIndex][columnIndex]
          : unknownCellContents[rowIndex][columnIndex];

    if (cell) {
      if (cell.name) {
        return (
          <React.Fragment key={key}>
            <HeaderComponent
              style={style}
              width={width}
              cell={cell}
              entrySquareSize={entrySquareSize}
              selectedFaces={selectedFaces}
              setSelectedFaces={setSelectedFaces}
            />
          </React.Fragment>
        );
      }
      if (cell.isTemp) {
        return <div key={key} style={{ ...style, height: entrySquareSize, width: entrySquareSize }} />;
      }

      return (
        <div key={key} style={style}>
          <FaceComponent
            handleClick={handleClick}
            handleShowClick={handleShowClick}
            cell={cell}
            isScrollingFast={false}
            selectMode={selectMode}
            isSelected={selectedFaces.map(face => face.face_id).includes(cell.id)}
            entrySquareSize={entrySquareSize}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: "flex", flexFlow: "column", height: "100%" }}>
      <Stack>
        <TabComponent
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
          notThisPerson={notThisPersonFunc}
        />
      </Stack>
      <div ref={ref} style={{ flexGrow: 1 }}>
        <AutoSizer>
          {({ height, width: gridWidth }) => (
            <ScrollScrubber
              scrollPositions={dataForScrollIndicator}
              scrollToY={setScrollTo}
              targetHeight={gridHeight}
              type={ScrollerType.enum.alphabet}
            >
              <Grid
                ref={gridRef}
                className="scrollscrubbertarget"
                style={{ overflowX: "hidden" }}
                disableHeader={false}
                cellRenderer={cellRenderer}
                columnWidth={entrySquareSize}
                columnCount={numEntrySquaresPerRow}
                rowHeight={entrySquareSize}
                onSectionRendered={onSectionRendered}
                height={height}
                width={gridWidth}
                rowCount={
                  activeTab === FacesTab.enum.labeled
                    ? labeledCellContents.length
                    : activeTab === FacesTab.enum.inferred
                      ? inferredCellContents.length
                      : unknownCellContents.length
                }
                scrollTop={tabs[activeTab].scrollPosition}
                onScroll={handleGridScroll}
              />
            </ScrollScrubber>
          )}
        </AutoSizer>
      </div>
      <ModalPersonEdit
        isOpen={modalPersonEditOpen}
        onRequestClose={() => {
          setModalPersonEditOpen(false);
          setSelectedFaces([]);
        }}
        selectedFaces={selectedFaces}
      />
      {lightboxShow && (
        <LightBox
          isPublic={false}
          idx2hash={idx2hash}
          lightboxImageIndex={lightboxImageIndex}
          lightboxImageId={lightboxImageId}
          onCloseRequest={() => {
            setLightboxShow(false);
            setScrollLocked(false);
          }}
          onImageLoad={() => {
            getPhotoDetails(idx2hash[lightboxImageIndex].id);
          }}
          onMovePrevRequest={() => {
            const prevIndex = (lightboxImageIndex + idx2hash.length - 1) % idx2hash.length;
            setLightboxImageIndex(prevIndex);
            setLightboxImageId(idx2hash[prevIndex].id);
            getPhotoDetails(idx2hash[prevIndex].id);
          }}
          onMoveNextRequest={() => {
            const nextIndex = (lightboxImageIndex + idx2hash.length + 1) % idx2hash.length;
            setLightboxImageIndex(nextIndex);
            setLightboxImageId(idx2hash[nextIndex].id);
            getPhotoDetails(idx2hash[nextIndex].id);
          }}
        />
      )}
    </div>
  );
}
