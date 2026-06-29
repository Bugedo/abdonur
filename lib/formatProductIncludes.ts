const MIN_PARTS_FOR_INCLUDES_LIST = 3;

export function parseProductIncludes(description: string): string[] {
  return description
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function shouldRenderIncludesList(description: string): boolean {
  return parseProductIncludes(description).length >= MIN_PARTS_FOR_INCLUDES_LIST;
}
