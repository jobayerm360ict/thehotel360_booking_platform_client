import { imageHostLink } from "@/constants/request";
const avatarFields = new Set(["avatar", "authorAvatar", "guestAvatar", "senderAvatar", "hostAvatar"]);
export function normalizeAssets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeAssets);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => {
    if (avatarFields.has(key)) {
      const avatar = typeof item === "string" ? item.trim() : "";
      return [key, !avatar ? "/app.svg" : /^(https?:\/\/|\/|data:|blob:)/.test(avatar) ? avatar : `${imageHostLink}/${avatar.replace(/^\/+/, "")}`];
    }
    return [key, normalizeAssets(item)];
  }));
}
