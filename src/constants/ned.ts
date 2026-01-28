export const NedDataType = {
  PRODUCTION_WIND_LAND: "1",
  PRODUCTION_SOLAR: "2",
  PRODUCTION_WIND_OFFSHORE: "51",
  PRODUCTION_GAS: "18",
  PRODUCTION_COAL: "19",
  PRODUCTION_NUCLEAR: "20",
  PRODUCTION_WASTE: "21",
  PRODUCTION_BIOMASS: "25",
  PRODUCTION_OTHER: "26",
  PRODUCTION_WKK: "35",
  PRODUCTION_TOTAL: "27",
  CONSUMPTION_GAS_HOUSEHOLDS: "55",
  CONSUMPTION_ELECTRICITY: "59",
} as const;

export const NedGranularity = {
  PER_10_MINUTES: "3",
  PER_15_MINUTES: "4",
  PER_HOUR: "5",
  PER_DAY: "6",
  PER_MONTH: "7",
  PER_YEAR: "8",
} as const;

export const NedForecastClassification = {
  FORECAST: "1",
  CURRENT: "2",
  BACKCAST: "3",
} as const;

export const NedActivity = {
  PRODUCTION: "1",
  CONSUMPTION: "2",
  IMPORT: "3",
  EXPORT: "4",
} as const;
