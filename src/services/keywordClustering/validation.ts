export function validateClusteringResult(result: any): void {
  if (!result.clusters || typeof result.clusters !== 'object') {
    throw new Error('Invalid clustering result: missing clusters object');
  }

  // Ensure all values are arrays
  Object.entries(result.clusters).forEach(([name, keywords]) => {
    if (!Array.isArray(keywords)) {
      throw new Error(`Invalid cluster format for "${name}"`);
    }
  });
}