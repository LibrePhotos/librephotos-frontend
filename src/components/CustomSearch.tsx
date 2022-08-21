import { Avatar, Group, Loader, Menu, Popover, TextInput } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { push } from "redux-first-history";
import { Album, Map, Search, Tag } from "tabler-icons-react";

import { fetchPlaceAlbumsList, fetchThingAlbumsList, fetchUserAlbumsList } from "../actions/albumsActions";
import { fetchPeople } from "../actions/peopleActions";
import { searchPeople, searchPhotos, searchPlaceAlbums, searchThingAlbums } from "../actions/searchActions";
import { fetchExampleSearchTerms } from "../actions/utilActions";
import { serverAddress } from "../api_client/apiClient";
import { useAppDispatch, useAppSelector } from "../store/store";

type PersonAvatarProps = {
  person: {
    key: string;
    face_url: string;
    text: string;
  };
};

function fuzzyMatch(str: string, pattern: string) {
  if (pattern.split("").length > 0) {
    const re = pattern.split("").reduce((a, b) => `${a}.*${b}`);
    return new RegExp(re).test(str);
  }
  return false;
}

function PersonAvatar({ person }: PersonAvatarProps) {
  const [opened, setOpened] = useState(false);

  return (
    <Popover opened={opened} onClose={() => setOpened(false)} withArrow position="bottom">
      <Popover.Target>
        <Avatar
          component={Link}
          to={`/person/${person.key}`}
          onMouseEnter={() => setOpened(true)}
          onMouseLeave={() => setOpened(false)}
          key={`suggestion_person_${person.key}`}
          size={50}
          radius="xl"
          src={serverAddress + person.face_url}
        />
      </Popover.Target>
      {person.text}
    </Popover>
  );
}

export function CustomSearch() {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [exampleSearchTerm, setExampleSearchTerm] = useState("");
  const [filteredExampleSearchTerms, setFilteredExampleSearchTerms] = useState<any[]>([]);
  const [filteredSuggestedPeople, setFilteredSuggestedPeople] = useState<any[]>([]);
  const [filteredSuggestedPlaces, setFilteredSuggestedPlaces] = useState<any[]>([]);
  const [filteredSuggestedThings, setFilteredSuggestedThings] = useState<any[]>([]);
  const [filteredSuggestedUserAlbums, setFilteredSuggestedUserAlbums] = useState<any[]>([]);
  const exampleSearchTerms = useAppSelector(store => store.util.exampleSearchTerms);
  const people = useAppSelector(store => store.people.people);
  const { albumsThingList, albumsUserList, albumsPlaceList } = useAppSelector(store => store.albums);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchExampleSearchTerms());
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      const example = exampleSearchTerms[Math.floor(Math.random() * exampleSearchTerms.length)];
      const searchTerm = example ? `${t("search.search")} ${example}` : t("search.default");
      setExampleSearchTerm(searchTerm || "");
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [exampleSearchTerms, t]);

  useEffect(() => {
    if (searchText) {
      if (people.length === 0) {
        fetchPeople(dispatch);
      }
      if (albumsPlaceList.length === 0) {
        dispatch(fetchPlaceAlbumsList());
      }
      if (albumsThingList.length === 0) {
        dispatch(fetchThingAlbumsList());
      }
      if (albumsUserList.length === 0) {
        dispatch(fetchUserAlbumsList());
      }
    }
  }, [searchText, albumsPlaceList, albumsThingList, albumsUserList, dispatch, people]);

  const filterSearchSuggestions = () => {
    let filterExamples = [];
    let filterPeople = [];
    let filterPlaces = [];
    let filterThings = [];
    let filterAlbums = [];
    if (searchText.trim().length !== 0) {
      // TODO(sickelap): use proper types
      filterExamples = exampleSearchTerms.filter((el: string) =>
        fuzzyMatch(el.toLowerCase(), searchText.toLowerCase())
      );
      filterPeople = filterPeople.filter((person: { text: string }) =>
        fuzzyMatch(person.text.toLowerCase(), searchText.toLowerCase())
      );
      filterPlaces = albumsPlaceList.filter((place: { title: string }) =>
        fuzzyMatch(place.title.toLowerCase(), searchText.toLowerCase())
      );
      filterThings = albumsThingList.filter((thing: { title: string }) =>
        fuzzyMatch(thing.title.toLowerCase(), searchText.toLowerCase())
      );
      filterAlbums = albumsUserList.filter((album: { title: string }) =>
        fuzzyMatch(album.title.toLowerCase(), searchText.toLowerCase())
      );
    }
    setFilteredExampleSearchTerms(filterExamples);
    setFilteredSuggestedPeople(filterPeople);
    setFilteredSuggestedPlaces(filterPlaces);
    setFilteredSuggestedThings(filterThings);
    setFilteredSuggestedUserAlbums(filterAlbums);
  };

  const handleChange = (d: React.FormEvent<HTMLInputElement>) => {
    setSearchText(d.currentTarget.value);

    filterSearchSuggestions();
  };

  return (
    <Menu>
      <Menu.Target>
        <TextInput
          icon={<Search size={14} />}
          onKeyPress={event => {
            switch (event.key) {
              case "Enter":
                dispatch(searchPhotos(searchText));
                dispatch(push("/search"));
                break;
              default:
                break;
            }
          }}
          onChange={handleChange}
          placeholder={exampleSearchTerm}
        />
      </Menu.Target>
      {filteredExampleSearchTerms.length > 0 &&
        filteredExampleSearchTerms.slice(0, 2).map(el => (
          <Menu.Item
            component={Link}
            to="/search"
            icon={<Search size={14} />}
            key={`suggestion_${el}`}
            onClick={() => {
              dispatch(searchPhotos(el));
              dispatch(searchPeople(el));
              dispatch(searchThingAlbums(el));
              dispatch(searchPlaceAlbums(el));
            }}
          >
            {el}
          </Menu.Item>
        ))}
      {filteredSuggestedUserAlbums.length > 0 &&
        filteredSuggestedUserAlbums.slice(0, 2).map(album => (
          <Menu.Item
            component={Link}
            to={`/useralbum/${album.id}`}
            icon={<Album size={14} />}
            key={`suggestion_place_${album.title}`}
          >
            {album.title}
          </Menu.Item>
        ))}
      {filteredSuggestedPlaces.length > 0 &&
        filteredSuggestedPlaces.slice(0, 2).map(place => (
          <Menu.Item
            component={Link}
            to={`/place/${place.id}`}
            icon={<Map size={14} />}
            key={`suggestion_place_${place.title}`}
          >
            {place.title}
          </Menu.Item>
        ))}
      {filteredSuggestedThings.length > 0 &&
        filteredSuggestedThings.slice(0, 2).map(thing => (
          <Menu.Item
            component={Link}
            to={`/thing/${thing.id}`}
            icon={<Tag size={14} />}
            key={`suggestion_thing_${thing.title}`}
          >
            {thing.title}
          </Menu.Item>
        ))}
      {filteredSuggestedPeople.length > 0 && (
        <Group>
          {filteredSuggestedPeople.map(person => (
            <PersonAvatar person={person} key={`suggestion_person_${person.text}`} />
          ))}
        </Group>
      )}
      {albumsThingList.length === 0 && searchText.length > 0 && (
        <Menu.Item icon={<Search size={14} />}>
          <Group>
            <Loader size={14} />
            {t("search.loading")}
          </Group>
        </Menu.Item>
      )}
    </Menu>
  );
}
