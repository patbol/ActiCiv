// Narrow review of Gitleaks generic-api-key matches in Next generated server metadata.
// Values never leave this process. Call only for server files and this exact rule.
export function generatedNextFinding(
  path: string,
  matched: string,
  manifest: {
    node: Record<string, unknown>;
    edge: Record<string, unknown>;
    encryptionKey: string;
  },
) {
  if (path === "server-reference-manifest.json") {
    return matched.trim() === `"encryptionKey": "${manifest.encryptionKey}"`;
  }
  if (!/^chunks\/ssr\/[^/]+_actions_[^/]+\.js$/.test(path)) return false;
  const found = matched.match(
    /^(?:[A-Za-z_$][\w$]*\.)?password,["']([a-f0-9]{40,42})["']$/,
  );
  return Boolean(
    found &&
    (Object.hasOwn(manifest.node, found[1]!) ||
      Object.hasOwn(manifest.edge, found[1]!)),
  );
}
