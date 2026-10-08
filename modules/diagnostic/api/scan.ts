import { ModuleApiHandler } from '../../../lib/modules/defineModule';
import { runDiagnosticScan } from '../../../lib/diagnostics/scanner';
import { getSetting } from '../../../lib/settings';

export const scanApiHandler: ModuleApiHandler = async ({ body }) => {
  const targetUrl = body?.url;
  if (!targetUrl || typeof targetUrl !== 'string') {
    return {
      status: 400,
      success: false,
      error: 'URL parameter is required for diagnostic scan.',
      code: 'MISSING_URL',
    };
  }

  try {
    const psiKey = await getSetting('google_psi_api_key');
    const report = await runDiagnosticScan(targetUrl, { psiApiKey: psiKey });
    return {
      status: 200,
      success: true,
      data: report,
    };
  } catch (err: any) {
    return {
      status: 500,
      success: false,
      error: err.message || 'Diagnostic scan failed',
      code: 'SCAN_FAILED',
    };
  }
};
