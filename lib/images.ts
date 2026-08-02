const CATEGORY_IMAGES: Record<string, string> = {
  Camping:
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=60",
  Cycling:
    "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=60",
  Fitness:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=60",
  "Team Sports":
    "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=60",
  "Water Sports":
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=60",
  "Winter Sports":
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=60",
};

const GENERIC_GEAR_IMAGE =
  "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=60";

const NAME_KEYWORDS: Array<[RegExp, string]> = [
  [
    /tennis|racket/i,
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=60",
  ],
  [/kayak|canoe/i, CATEGORY_IMAGES["Water Sports"]],
  [/tent|camping|camp/i, CATEGORY_IMAGES.Camping],
  [/bike|bicycle|cycling/i, CATEGORY_IMAGES.Cycling],
  [/soccer|football/i, CATEGORY_IMAGES["Team Sports"]],
  [/snowboard|ski/i, CATEGORY_IMAGES["Winter Sports"]],
  [/dumbbell|gym|yoga/i, CATEGORY_IMAGES.Fitness],
];

export function gearCover(
  images: string[] | undefined,
  name = "",
  category = ""
): string {
  if (images && images.length > 0 && images[0]) return images[0];

  const keywordMatch = NAME_KEYWORDS.find(([re]) => re.test(name));
  if (keywordMatch) return keywordMatch[1];

  const categoryMatch = Object.entries(CATEGORY_IMAGES).find(
    ([cat]) => cat.toLowerCase() === category.trim().toLowerCase()
  );
  if (categoryMatch) return categoryMatch[1];

  return GENERIC_GEAR_IMAGE;
}
