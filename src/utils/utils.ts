import * as d3 from 'd3';
import { industryType, IndustryType, IndustryTypeNames } from '../types';

const industryColor = d3.schemeSet1;

const industryColorScale = d3.scaleOrdinal(industryType, industryColor);

export function getIndustryNames(values: IndustryType[] = []) {
  return values?.map((d) => IndustryTypeNames[d]);
}

export function getIndustryColor(val: IndustryType): string {
  return industryColorScale(val);
}
