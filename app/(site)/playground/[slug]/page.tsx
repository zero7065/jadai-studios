'use client';

import React from 'react';
import ToolRunnerPage from '@/components/playground/ToolRunnerPage';
import ForgeModulePage from '@/modules/forge/page';
import MirageModulePage from '@/modules/mirage/page';
import SentinelModulePage from '@/modules/sentinel/page';
import OraclePage from '@/app/(site)/oracle/page';

import BrandedErrorFallback from '@/components/ui/BrandedErrorFallback';

export default function PlaygroundToolDynamicPage({
  params,
  onNavigate,
}: {
  params: { slug: string };
  onNavigate?: (path: string) => void;
}) {
  try {
    const normalizedSlug = params.slug.toLowerCase().trim();

    if (normalizedSlug === 'forge') {
      return <ForgeModulePage />;
    }

    if (normalizedSlug === 'mirage') {
      return <MirageModulePage />;
    }

    if (normalizedSlug === 'sentinel') {
      return <SentinelModulePage />;
    }

    if (normalizedSlug === 'oracle' || normalizedSlug === 'prime') {
      return <OraclePage />;
    }

    return <ToolRunnerPage slug={params.slug} onNavigate={onNavigate} />;
  } catch {
    return <BrandedErrorFallback onNavigate={onNavigate} message="This creation tool couldn't load." />;
  }
}

