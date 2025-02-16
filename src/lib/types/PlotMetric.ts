export type PlotMetric = "recurrenceRate" | "determinism" | "determinism2" | "laminarity" | "laminarity2" | "verticalLaminarity" | "verticalLaminarity2" | "horizontalLaminarity" | "horizontalLaminarity2" | "detLamDifference" | "corm";
export type HorizonPlotMetric = Omit<PlotMetric, "detLamDifference" | "avgDiagonalLength">;

export type HorizonPlotSeriesSetup = {
    metric: HorizonPlotMetric;
    label: string;
    colorPalette: [string, string];
}

export type HorizonPlotBarVector = {
    values: number[];
    horizonSlicesColors: string[];
}
