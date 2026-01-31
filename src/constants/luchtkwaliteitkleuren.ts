type LkiStyle = {
  color: string;
  name: string;
  plot_color: string;
};

const enum plotKleuren {
  GOED = "rgb(150, 200, 255)",
  MATIG = "rgb(255,255,206)",
  ONVOLDOENDE = "rgb(247,202,69)",
  SLECHT = "rgb(236,90,41)",
  ZEER_SLECHT = "rgb(152,65,210)",
}

type LkiIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 999;

const luchtkwaliteitKleuren: Record<LkiIndex, LkiStyle> = {
  0: {
    color: "rgb(42,99,246)",
    name: "Goed",
    plot_color: plotKleuren.GOED,
  },
  1: {
    color: "rgb(42,99,246)",
    name: "Goed",
    plot_color: plotKleuren.GOED,
  },
  2: {
    color: "rgb(78,173,249)",
    name: "Goed",
    plot_color: plotKleuren.GOED,
  },
  3: {
    color: "rgb(161,199,250)",
    name: "Goed",
    plot_color: plotKleuren.GOED,
  },
  4: {
    color: "rgb(255,255,206)",
    name: "Matig",
    plot_color: plotKleuren.MATIG,
  },
  5: {
    color: "rgb(255,255,163)",
    name: "Matig",
    plot_color: plotKleuren.MATIG,
  },
  6: {
    color: "rgb(255,255,85)",
    name: "Matig",
    plot_color: plotKleuren.MATIG,
  },
  7: {
    color: "rgb(247,202,69)",
    name: "Onvoldoende",
    plot_color: plotKleuren.ONVOLDOENDE,
  },
  8: {
    color: "rgb(241,155,56)",
    name: "Onvoldoende",
    plot_color: plotKleuren.ONVOLDOENDE,
  },
  9: {
    color: "rgb(236,90,41)",
    name: "Slecht",
    plot_color: plotKleuren.SLECHT,
  },
  10: {
    color: "rgb(234,58,36)",
    name: "Slecht",
    plot_color: plotKleuren.SLECHT,
  },
  11: {
    color: "rgb(152,65,210)",
    name: "Zeer slecht",
    plot_color: plotKleuren.ZEER_SLECHT,
  },
  999: {
    color: "rgb(200,200,200)",
    name: "Onbekend",
    plot_color: "rgb(200,200,200)",
  },
};

export function getLkiStyle(value: number | null): LkiStyle {
  const key: LkiIndex =
    value !== null && value in luchtkwaliteitKleuren
      ? (value as LkiIndex)
      : 999;

  return luchtkwaliteitKleuren[key];
}
