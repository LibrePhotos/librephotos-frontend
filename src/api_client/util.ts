import { z } from "zod";

import { api } from "./api";

export const LocationSunburstSchema = z.lazy(() =>
  z.object({
    name: z.string(),
    hex: z.string().optional(),
    children: z.array(LocationSunburstSchema).optional(),
  })
);

type LocationSunburst = z.infer<typeof LocationSunburstSchema>;

export const CountStatsSchema = z.object({
  num_photos: z.number(),
  num_missing_photos: z.number(),
  num_faces: z.number(),
  num_people: z.number(),
  num_unknown_faces: z.number(),
  num_labeled_faces: z.number(),
  num_inferred_faces: z.number(),
  num_albumauto: z.number(),
  num_albumdate: z.number(),
  num_albumuser: z.number(),
});

type CountStats = z.infer<typeof CountStatsSchema>;
export const COUNT_STATS_DEFAULTS: CountStats = {
  num_photos: 0,
  num_missing_photos: 0,
  num_faces: 0,
  num_people: 0,
  num_unknown_faces: 0,
  num_labeled_faces: 0,
  num_inferred_faces: 0,
  num_albumauto: 0,
  num_albumdate: 0,
  num_albumuser: 0,
};

enum Endpoints {
  fetchTimezones = "fetchTimezones",
  fetchLocationTree = "fetchLocationTree",
  fetchCountStats = "fetchCountStats",
}

const TimezonesSchema = z.string().array();
type Timezones = z.infer<typeof TimezonesSchema>;

const utilApi = api
  .injectEndpoints({
    endpoints: builder => ({
      [Endpoints.fetchTimezones]: builder.query<Timezones, void>({
        query: () => "timezones/",
        transformResponse: (response: string) => {
          try {
            const timezones = JSON.parse(response);
            return TimezonesSchema.parse(timezones);
          } catch (e) {
            return [];
          }
        },
      }),
      [Endpoints.fetchLocationTree]: builder.query<LocationSunburst, void>({
        query: () => "locationsunburst/",
        transformResponse: response => LocationSunburstSchema.parse(response),
      }),
      [Endpoints.fetchCountStats]: builder.query<CountStats, void>({
        query: () => "stats/",
        transformResponse: response => CountStatsSchema.parse(response),
      }),
    }),
  })
  .enhanceEndpoints<"Timezones" | "LocationTree">({
    addTagTypes: ["Timezones", "LocationTree"],
    endpoints: {
      [Endpoints.fetchTimezones]: {
        providesTags: ["Timezones"],
      },
      [Endpoints.fetchLocationTree]: {
        providesTags: ["LocationTree"],
      },
    },
  });

export const { useFetchTimezonesQuery, useFetchLocationTreeQuery, useFetchCountStatsQuery } = utilApi;