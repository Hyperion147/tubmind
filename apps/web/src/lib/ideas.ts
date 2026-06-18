export function isIdeaLive(input: {
  status: string;
  visibility: string;
}) {
  return input.visibility === "public";
}

export function getPublishedAtForState(input: {
  status: string;
  visibility: string;
  existingPublishedAt: Date | null;
}) {
  return isIdeaLive(input) ? input.existingPublishedAt ?? new Date() : null;
}
