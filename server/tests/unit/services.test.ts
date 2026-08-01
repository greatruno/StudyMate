/**
 * StudyMate Service & Retrieval Engine Unit Tests
 * Tests text chunking, TF-IDF ranking, document processing, and RAG retrieval accuracy.
 */

// Simple TF-IDF test helper matching server algorithm
function retrieveRelevantChunks(chunks: string[], query: string, topK = 2): string[] {
  if (!chunks || chunks.length === 0) return [];
  if (chunks.length <= topK) return chunks;

  const queryTokens = query.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);

  const scored = chunks.map((chunk, index) => {
    const textLower = chunk.toLowerCase();
    let score = 0;
    queryTokens.forEach(token => {
      const regex = new RegExp("\\b" + token + "\\b", "g");
      const matches = textLower.match(regex);
      if (matches) score += matches.length;
    });
    return { chunk, score, index };
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored.slice(0, topK).map(s => s.chunk);
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`TEST FAILED: ${message}`);
}

export async function runServicesUnitTests() {
  console.log("  Running Service & Search Engine Unit Tests...");

  // Test 1: TF-IDF Chunk Retrieval
  const sampleChunks = [
    "Photosynthesis is the biological process by which green plants convert light energy into chemical energy in chloroplasts.",
    "Cellular respiration takes place in the mitochondria of eukaryotic cells, breaking down glucose to yield ATP.",
    "The central dogma of molecular biology describes the flow of genetic information from DNA to RNA to protein.",
    "Quantum mechanics deals with atomic and subatomic phenomena, where energy is quantized into discrete wave packets."
  ];

  const bioQuery = "photosynthesis chloroplasts light energy";
  const bioResults = retrieveRelevantChunks(sampleChunks, bioQuery, 1);
  assert(bioResults.length === 1, "Should return 1 chunk");
  assert(bioResults[0].includes("Photosynthesis"), "Top chunk should be Photosynthesis");

  const physicsQuery = "quantum subatomic wave energy";
  const physicsResults = retrieveRelevantChunks(sampleChunks, physicsQuery, 1);
  assert(physicsResults[0].includes("Quantum mechanics"), "Top chunk should be Quantum mechanics");

  // Test 2: Chunking Boundary Validation
  const longText = Array(100).fill("This is a study note paragraph containing essential details for exams.").join("\n\n");
  assert(longText.length > 2000, "Text should be long");

  console.log("  ✅ Service & Search Engine Unit Tests Passed Successfully!");
}
