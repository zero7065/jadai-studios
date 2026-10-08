import { JadaiModule } from './defineModule';
import forgeModule from '../../modules/forge';
import mirageModule from '../../modules/mirage';
import sentinelModule from '../../modules/sentinel';
import diagnosticModule from '../../modules/diagnostic';
import oracleModule from '../../modules/oracle';
import dreamForgeModule from '../../modules/dream-forge';
import resumeEditorModule from '../../modules/resume-editor';
import docAnalyzerModule from '../../modules/doc-analyzer';
import growthMakerModule from '../../modules/growth-maker';
import templateMarketModule from '../../modules/template-market';
import hubModule from '../../modules/hub';
import bookOfLiesModule from '../../modules/book-of-lies';
import careerBoardModule from '../../modules/career-board';
import templateModule from '../../modules/_template';

export const JADAI_MODULES: Record<string, JadaiModule> = {
  'forge': forgeModule,
  'mirage': mirageModule,
  'sentinel': sentinelModule,
  'diagnostic': diagnosticModule,
  'oracle': oracleModule,
  'dream-forge': dreamForgeModule,
  'resume-editor': resumeEditorModule,
  'doc-analyzer': docAnalyzerModule,
  'growth-maker': growthMakerModule,
  'template-market': templateMarketModule,
  'hub': hubModule,
  'book-of-lies': bookOfLiesModule,
  'career-board': careerBoardModule,
  '_template': templateModule,
};

export function getModuleBySlug(slug: string): JadaiModule | undefined {
  return JADAI_MODULES[slug];
}

export function getAllModules(): JadaiModule[] {
  return Object.values(JADAI_MODULES);
}
