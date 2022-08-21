/* eslint-disable */
import { Image, Loader } from "@mantine/core";
import _ from "lodash";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { Map, Marker, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { connect } from "react-redux";
import { AutoSizer, Grid } from "react-virtualized";
import { compose } from "redux";
import { push } from "redux-first-history";
import { Map2 } from "tabler-icons-react";

import { fetchPlaceAlbumsList } from "../../actions/albumsActions";
import { fetchLocationClusters } from "../../actions/utilActions";
import { serverAddress } from "../../api_client/apiClient";
import { LEFT_MENU_WIDTH, TOP_MENU_HEIGHT } from "../../ui-constants";
import { HeaderComponent } from "./HeaderComponent";

const SIDEBAR_WIDTH = LEFT_MENU_WIDTH;

export class AlbumPlace extends Component {
  state = {
    visibleMarkers: [],
    visiblePlaceAlbums: [],
    locationClusters: [],
    width: window.innerWidth,
    height: window.innerHeight,
    entrySquareSize: 200,
    gridHeight: window.innerHeight - TOP_MENU_HEIGHT - 300,
    headerHeight: 60,
    numEntrySquaresPerRow: 3,
  };

  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.preprocess = this.preprocess.bind(this);
    this.calculateEntrySquareSize = this.calculateEntrySquareSize.bind(this);
  }

  componentDidMount() {
    this.calculateEntrySquareSize();

    window.addEventListener("resize", this.calculateEntrySquareSize);

    if (this.props.albumsPlaceList.length === 0) {
      this.props.dispatch(fetchPlaceAlbumsList());
    }

    if (!this.props.fetchedLocationClusters) {
      this.props.dispatch(fetchLocationClusters());
    }

    let resizeDone = false;

    // attempt resize 8 times; mapRef.current might be undefined
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        if (!resizeDone) {
          if (this.mapRef.current) {
            const map = this.mapRef.current.leafletElement;
            map.invalidateSize(true);
            resizeDone = true;
          }
        }
      }, 1000 * (i + 1));
    }
  }

  onViewportChanged = viewport => {
    this.setState({ viewport });

    const map = this.mapRef.current.leafletElement;

    // map.invalidateSize was undefined when this was called from Map div context
    if (map.invalidateSize) {
      map.invalidateSize(true);
    }

    const bounds = map.getBounds();

    const visibleMarkers = this.props.locationClusters.filter(loc => {
      const markerLat = loc[0];
      const markerLng = loc[1];
      if (
        markerLat < bounds._northEast.lat &&
        markerLat > bounds._southWest.lat &&
        markerLng < bounds._northEast.lng &&
        markerLng > bounds._southWest.lng
      ) {
        return true;
      }
      return false;
    });

    const visiblePlaceNames = visibleMarkers.map(el => el[2]);

    const visiblePlaceAlbums = this.props.albumsPlaceList.filter(el => {
      if (visiblePlaceNames.includes(el.title)) {
        return true;
      }
      return false;
    });

    this.setState({
      visibleMarkers: visibleMarkers,
      visiblePlaceAlbums: _.sortBy(visiblePlaceAlbums, ["geolocation_level", "photo_count"]),
    });
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.locationClusters.length === 0) {
      const visibleMarkers = nextProps.locationClusters;
      const visiblePlaceNames = visibleMarkers.map(el => el[2]);
      const visiblePlaceAlbums = nextProps.albumsPlaceList.filter(el => {
        if (visiblePlaceNames.includes(el.title)) {
          return true;
        }
        return false;
      });

      return {
        visibleMarkers: nextProps.locationClusters,
        locationClusters: nextProps.locationClusters,
        visiblePlaceAlbums: _.sortBy(visiblePlaceAlbums, ["geolocation_level", "photo_count"]),
      };
    }
    return { ...prevState };
  }

  preprocess() {
    const markers = this.props.locationClusters.map((loc, index) => {
      if (loc[0] !== 0) {
        return <Marker key={index} position={[loc[0], loc[1]]} title={loc[2]} />;
      }
      return <div />;
    });
    return markers;
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.calculateEntrySquareSize);
  }

  calculateEntrySquareSize() {
    let numEntrySquaresPerRow = 6;
    if (window.innerWidth < 600) {
      numEntrySquaresPerRow = 2;
    } else if (window.innerWidth < 800) {
      numEntrySquaresPerRow = 3;
    } else if (window.innerWidth < 1000) {
      numEntrySquaresPerRow = 4;
    } else if (window.innerWidth < 1200) {
      numEntrySquaresPerRow = 5;
    }

    const columnWidth = window.innerWidth - SIDEBAR_WIDTH - 5 - 5 - 15;

    const entrySquareSize = columnWidth / numEntrySquaresPerRow;
    this.setState({
      ...this.state,
      width: window.innerWidth,
      height: window.innerHeight,
      entrySquareSize: entrySquareSize,
      numEntrySquaresPerRow: numEntrySquaresPerRow,
    });
  }

  showPlaceAlbum = id => {
    this.props.dispatch(push(`/place/${id}/`));
  };

  cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const place = this.state.visiblePlaceAlbums;
    const albumPlaceIndex = rowIndex * this.state.numEntrySquaresPerRow + columnIndex;
    if (albumPlaceIndex < place.length) {
      return (
        <div key={key} style={style}>
          <div style={{ padding: 5, cursor: "pointer" }}>
            {place[albumPlaceIndex].cover_photos.slice(0, 1).map((photo, index) => (
              <Image
                onClick={() => this.showPlaceAlbum(place[albumPlaceIndex].id)}
                width={this.state.entrySquareSize - 10}
                height={this.state.entrySquareSize - 10}
                src={`${serverAddress}/media/thumbnails_big/${photo.image_hash}`}
              />
            ))}
          </div>
          <div style={{ paddingLeft: 15, paddingRight: 15, height: 50 }}>
            <b>{place[albumPlaceIndex].title}</b>
            <br />{" "}
            {this.props.t("numberofphotos", {
              number: place[albumPlaceIndex].photo_count,
            })}
          </div>
        </div>
      );
    }
    return <div key={key} style={style} />;
  };

  render() {
    if (this.props.fetchedLocationClusters) {
      const markers = this.preprocess();

      return (
        <div>
          <HeaderComponent
            icon={<Map2 size={50} />}
            title={this.props.t("places")}
            fetching={this.props.fetchingAlbumsPlaceList}
            subtitle={this.props.t("placealbum.showingplaces", {
              number: this.state.visiblePlaceAlbums.length,
            })}
          />
          <div style={{ marginLeft: -5 }}>
            <Map
              ref={this.mapRef}
              className="markercluster-map"
              style={{
                height: 240,
              }}
              onViewportChanged={this.onViewportChanged}
              center={[40, 0]}
              zoom={2}
            >
              <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MarkerClusterGroup>{markers}</MarkerClusterGroup>
            </Map>
          </div>
          <AutoSizer disableHeight style={{ outline: "none", padding: 0, margin: 0 }}>
            {({ width }) => (
              <Grid
                style={{ outline: "none" }}
                disableHeader={false}
                cellRenderer={this.cellRenderer}
                columnWidth={this.state.entrySquareSize}
                columnCount={this.state.numEntrySquaresPerRow}
                height={this.state.gridHeight}
                rowHeight={this.state.entrySquareSize + 60}
                rowCount={Math.ceil(this.state.visiblePlaceAlbums.length / this.state.numEntrySquaresPerRow.toFixed(1))}
                width={width}
              />
            )}
          </AutoSizer>
        </div>
      );
    }
    return (
      <div style={{ height: this.props.height }}>
        <Loader>{this.props.t("placealbum.maploading")}</Loader>
      </div>
    );
  }
}

AlbumPlace = compose(
  connect(store => ({
    albumsPlaceList: store.albums.albumsPlaceList,
    locationClusters: store.util.locationClusters,
    fetchingLocationClusters: store.util.fetchingLocationClusters,
    fetchedLocationClusters: store.util.fetchedLocationClusters,
  })),
  withTranslation()
)(AlbumPlace);
