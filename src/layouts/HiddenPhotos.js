import React, { Component } from 'react';
import { connect } from "react-redux";
import { fetchHiddenPhotos } from '../actions/photosActions';
import moment from 'moment'
import _ from 'lodash'
import { PhotoListView } from './ReusablePhotoListView'

export class HiddenPhotos extends Component {
  state = {
    photosGroupedByDate: [],
    idx2hash: [],
  }

  componentDidMount() {
    this.props.dispatch(fetchHiddenPhotos())
  }



  static getDerivedStateFromProps(nextProps,prevState){
      const photos = nextProps.hiddenPhotos
      if (prevState.idx2hash.length !== photos.length) {
          var groupedByDate = _.groupBy(photos,(el)=>{
              if (el.exif_timestamp) {
                  return moment(el.exif_timestamp).format('YYYY-MM-DD')
              } else {
                  return "No Timestamp"
              }
          })
          var groupedByDateList = _.reverse(_.sortBy(_.toPairsIn(groupedByDate).map((el)=>{
              return {date:el[0],photos:el[1]}
          }),(el)=>el.date))

          var idx2hash = []
          groupedByDateList.forEach((g)=>{
              g.photos.forEach((p)=>{
                  idx2hash.push(p.image_hash)
              })
          })
          return {
              ...prevState, 
              photosGroupedByDate: groupedByDateList,
              idx2hash:idx2hash,
          }
      } else {
        return null
      }
  }

  render() {
    const {fetchingHiddenPhotos} = this.props
    return (
      <PhotoListView 
        showHidden={true}
        title={"Hidden Photos"}
        loading={fetchingHiddenPhotos}
        titleIconName={'hide'}
        photosGroupedByDate={this.state.photosGroupedByDate}
        idx2hash={this.state.idx2hash}
      />
    )  
  }
}

HiddenPhotos = connect((store)=>{
  return {
    favoritePhotos: store.photos.favoritePhotos,
    fetchingFavoritePhotos: store.photos.fetchingFavoritePhotos,
    fetchedFavoritePhotos: store.photos.fetchedFavoritePhotos,

    hiddenPhotos: store.photos.hiddenPhotos,
    fetchingHiddenPhotos: store.photos.fetchingHiddenPhotos,
    fetchedHiddenPhotos: store.photos.fetchedHiddenPhotos,

    albumsPeople: store.albums.albumsPeople,
    fetchingAlbumsPeople: store.albums.fetchingAlbumsPeople,
    fetchedAlbumsPeople: store.albums.fetchedAlbumsPeople,
    people: store.people.people,
    fetchedPeople: store.people.fetched,
    fetchingPeople: store.people.fetching,
    photoDetails: store.photos.photoDetails,
    fetchingPhotoDetail: store.photos.fetchingPhotoDetail,
    fetchedPhotoDetail: store.photos.fetchedPhotoDetail,
  }
})(HiddenPhotos)
