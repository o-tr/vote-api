export const extractBasicAuthPassword = (header: string | undefined): string | null => {
  if (!header) return null;
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Basic") return null;
  const decoded = Buffer.from(parts[1], "base64").toString("utf-8");
  const colonIndex = decoded.indexOf(":");
  if (colonIndex === -1) return null;
  return decoded.slice(colonIndex + 1);
}
