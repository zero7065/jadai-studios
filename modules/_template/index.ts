import React from 'react';
import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import { templateActionHandler } from './api/action';
import TemplatePage from './page';

export const templateModule: JadaiModule = defineModule({
  slug: '_template',
  name: 'Standard Template Module',
  description: 'Blueprint architecture demonstrating module definition, isolated API routing, and state.',
  icon: 'Layers',
  version: '1.0.0',
  status: 'beta',
  requiredTier: 'free',
  component: TemplatePage,
  routes: {
    page: '/modules/_template',
    api: {
      action: templateActionHandler,
    },
  },
  config: {
    demoKey: 'value',
  },
  metadata: {
    author: 'Jehu Nanpan',
    tagline: 'Standard architectural module specification',
  },
});

export default templateModule;
