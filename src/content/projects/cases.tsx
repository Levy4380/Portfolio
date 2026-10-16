import crucijuegosCover from '../../assets/projects/crucijuegos.png';
import fiumeCover from '../../assets/projects/fiume.png';
import herLightingCover from '../../assets/projects/her-lighting.png';
import pekataCover from '../../assets/projects/pekata.png';
import printempsCover from '../../assets/projects/printemps.png';
import robinLampsCover from '../../assets/projects/robin-lamps.png';
import type { ImageAsset } from '../types.ts';
import { defineCase, type CaseConfig } from './CaseDocument.tsx';

const tonica = 'https://www.wearetonica.com/casos';

function cover(src: string, width: number, height: number): ImageAsset {
  return { src, alt: '', width, height };
}

const cases = [
  {
    id: 'project:pekata',
    path: '/projects/pekata',
    fileName: 'pekata.site',
    title: 'projects.pekata.title',
    summary: 'projects.pekata.summary',
    category: 'projects.pekata.category',
    imageAlt: 'projects.pekata.imageAlt',
    client: 'Pekata Foods',
    year: '2024',
    challenge: 'projects.pekata.challenge',
    solution: 'projects.pekata.solution',
    result: 'projects.pekata.result',
    cover: cover(pekataCover, 1500, 828),
    technologies: ['Shopify', 'Custom App', 'Node', 'Webhooks'],
  },
  {
    id: 'project:crucijuegos',
    path: '/projects/crucijuegos',
    fileName: 'crucijuegos.site',
    title: 'projects.crucijuegos.title',
    summary: 'projects.crucijuegos.summary',
    category: 'projects.crucijuegos.category',
    imageAlt: 'projects.crucijuegos.imageAlt',
    client: 'Crucijuegos',
    year: '2024',
    challenge: 'projects.crucijuegos.challenge',
    solution: 'projects.crucijuegos.solution',
    result: 'projects.crucijuegos.result',
    cover: cover(crucijuegosCover, 1600, 1000),
    liveUrl: 'https://site.cruci.com.ar/',
    technologies: ['Shopify', 'Quote builder', 'i18n'],
  },
  {
    id: 'project:printemps',
    path: '/projects/printemps',
    fileName: 'printemps.site',
    title: 'projects.printemps.title',
    summary: 'projects.printemps.summary',
    category: 'projects.printemps.category',
    imageAlt: 'projects.printemps.imageAlt',
    client: 'Grupo Printemps',
    year: '2024',
    challenge: 'projects.printemps.challenge',
    solution: 'projects.printemps.solution',
    result: 'projects.printemps.result',
    cover: cover(printempsCover, 1600, 1000),
    liveUrl: 'https://printemps.com.ar/',
    technologies: ['Shopify', 'Liquid', 'Custom Theme'],
  },
  {
    id: 'project:fiume',
    path: '/projects/fiume',
    fileName: 'fiume.site',
    title: 'projects.fiume.title',
    summary: 'projects.fiume.summary',
    category: 'projects.fiume.category',
    imageAlt: 'projects.fiume.imageAlt',
    client: 'Fiume Shop',
    year: '2024',
    challenge: 'projects.fiume.challenge',
    solution: 'projects.fiume.solution',
    result: 'projects.fiume.result',
    cover: cover(fiumeCover, 1600, 1000),
    liveUrl: 'https://fiume.com.ar/',
    technologies: ['Shopify', 'Liquid', 'Custom Theme'],
  },
  {
    id: 'project:her-lighting',
    path: '/projects/her-lighting',
    fileName: 'her-lighting.site',
    title: 'projects.herLighting.title',
    summary: 'projects.herLighting.summary',
    category: 'projects.herLighting.category',
    imageAlt: 'projects.herLighting.imageAlt',
    client: 'Her Lighting',
    year: '2024',
    challenge: 'projects.herLighting.challenge',
    solution: 'projects.herLighting.solution',
    result: 'projects.herLighting.result',
    cover: cover(herLightingCover, 1600, 1000),
    liveUrl: 'https://herlighting.com/',
    technologies: ['Shopify', 'Liquid', 'Custom Quote App'],
  },
  {
    id: 'project:robin-lamps',
    path: '/projects/robin-lamps',
    fileName: 'robin-lamps.site',
    title: 'projects.robinLamps.title',
    summary: 'projects.robinLamps.summary',
    category: 'projects.robinLamps.category',
    imageAlt: 'projects.robinLamps.imageAlt',
    client: 'Robin Lamps',
    year: '2024',
    challenge: 'projects.robinLamps.challenge',
    solution: 'projects.robinLamps.solution',
    result: 'projects.robinLamps.result',
    cover: cover(robinLampsCover, 1600, 1000),
    liveUrl: 'https://robinlamps.com/',
    technologies: ['Shopify', 'Liquid', 'Shopify Markets', 'Custom Theme'],
  },
] as const satisfies readonly CaseConfig[];

export const caseProjects = cases.map((config) => ({
  config,
  file: defineCase(config),
}));

const featuredIds = ['project:crucijuegos', 'project:printemps'] as const;

export const featuredProjects = featuredIds.map((id) => {
  const project = caseProjects.find((item) => item.config.id === id);
  if (!project) {
    throw new Error(`Missing featured project ${id}`);
  }
  return project;
});
