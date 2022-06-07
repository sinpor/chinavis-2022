import * as d3 from 'd3';
import { industryType, IndustryType, IndustryTypeNames } from '../types';

const industryColor = d3.schemeOranges;

export function getIndustryNames(values: IndustryType[] = []) {
  return values?.map((d) => IndustryTypeNames[d]);
}

export function getIndustryColor(val: IndustryType): string {
  return d3.scaleOrdinal().domain(industryType).range(industryColor)(val) as string;
}
