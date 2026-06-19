export const ideaQueryKeys = {
  all: ["ideas"] as const,
  mine: ["ideas", "mine"] as const,
  detail: (ideaId: string) => ["ideas", "detail", ideaId] as const,
  comments: (ideaId: string) => ["ideas", ideaId, "comments"] as const,
};
