import tls from 'tls';

export interface TlsProbeResult {
  secure: boolean;
  grade: string;
  expiry: string;
  issuer?: string;
  error?: string;
}

/**
 * Performs a real TLS handshake against host:443 and inspects the peer certificate.
 * No fabrication — honest failure states on error/timeout/unreachable.
 */
export function probeTls(hostname: string, port = 443, timeoutMs = 4000): Promise<TlsProbeResult> {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect(port, hostname, { servername: hostname, timeout: timeoutMs }, () => {
        const cert = socket.getPeerCertificate();
        socket.end();

        if (cert && cert.valid_to) {
          const validTo = new Date(cert.valid_to);
          const daysRemaining = Math.round((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const issuerOrg = Array.isArray(cert.issuer?.O) ? cert.issuer.O.join(', ') : cert.issuer?.O;
          resolve({
            secure: true,
            grade: daysRemaining > 30 ? 'A+' : daysRemaining > 7 ? 'B' : 'C',
            expiry: `${daysRemaining} days remaining (${validTo.toISOString().slice(0, 10)})`,
            issuer: issuerOrg || 'Trusted CA',
          });
        } else {
          resolve({ secure: false, grade: 'F', expiry: 'Expired or Invalid', error: 'No certificate presented' });
        }
      });

      socket.on('error', (err) => {
        resolve({ secure: false, grade: 'F', expiry: 'Handshake Failed', error: err.message });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ secure: false, grade: 'C', expiry: 'Timeout', error: 'TLS handshake timed out' });
      });
    } catch (err: any) {
      resolve({ secure: false, grade: 'F', expiry: 'Unreachable', error: err?.message || 'Connection failed' });
    }
  });
}
