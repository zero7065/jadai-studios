import React from 'react';

export type ModuleTier = 'free' | 'foundation' | 'voice' | 'architecture' | 'prime';
export type ModuleStatus = 'active' | 'beta' | 'coming_soon' | 'disabled';

export interface ModuleApiHandler {
  (params: {
    action: string;
    body: any;
    query: Record<string, string>;
    userId?: string;
    userTier?: ModuleTier;
    isAdmin?: boolean;
    ip?: string;
  }): Promise<{
    status?: number;
    success: boolean;
    data?: any;
    error?: string;
    code?: string;
    tokensUsed?: number;
    provider?: string;
  }>;
}

export interface JadaiModule {
  slug: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  version: string;
  status: ModuleStatus;
  requiredTier: ModuleTier;
  component: React.ComponentType<any>;
  routes: {
    page: string;
    api: Record<string, ModuleApiHandler>;
  };
  config?: Record<string, any>;
  metadata?: {
    author?: string;
    tagline?: string;
    freeQuota?: number;
  };
}

export function defineModule(moduleConfig: JadaiModule): JadaiModule {
  // Validate non-negotiable contract
  if (!moduleConfig.slug || !moduleConfig.name || !moduleConfig.component) {
    throw new Error(`Module definition error: slug, name, and component are mandatory. Received slug: ${moduleConfig.slug}`);
  }
  return moduleConfig;
}
