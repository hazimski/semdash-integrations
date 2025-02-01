export const PROMPTS = {
  semantic: 'Group these keywords based on their semantic meaning and search intent. Create clusters where keywords share similar meanings or purposes.',
  modifier: 'Group these keywords based on their modifiers (e.g., "best", "how to", "vs", "for", etc.). Each cluster should represent a specific modifier type.',
  topic: 'Group these keywords into distinct topical clusters. Each cluster should represent a specific subject matter or subtopic.',
  theme: 'Group these keywords into broad thematic categories. Each cluster should represent a high-level theme.'
};

export function buildClusteringPrompt(keywords: string[], type: keyof typeof PROMPTS): string {
  return `${PROMPTS[type]}

Keywords to cluster:
${keywords.join('\n')}

Respond with a JSON object where each key is a descriptive cluster name and the value is an array of keywords that belong to that cluster. Example format:
{
  "clusters": {
    "Informational Queries": ["what is", "how to", "guide"],
    "Commercial Intent": ["best", "buy", "price"]
  }
}`;
}