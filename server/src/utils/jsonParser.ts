/**
 * Safely extracts and parses JSON from a string that might contain markdown blocks,
 * conversational filler, or trailing garbage.
 *
 * @param text The raw output from the LLM
 * @returns Parsed JSON object
 * @throws Error if no valid JSON object/array can be found and parsed
 */
export const extractJson = <T = any>(text: string): T => {
  if (!text) {
    throw new Error('Empty text provided for JSON extraction');
  }

  // 1. Try straightforward JSON parse first
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    // 2. If it fails, fallback to regex extraction to find the outermost object or array
    const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    
    if (match && match[0]) {
      try {
        return JSON.parse(match[0]);
      } catch (innerError) {
        throw new Error('Found JSON-like structure but it was invalid JSON.');
      }
    }
    
    throw new Error('Could not extract any JSON structure from the response.');
  }
};
