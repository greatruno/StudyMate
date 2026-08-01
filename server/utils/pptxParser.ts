import JSZip from "jszip";

/**
 * Extracts plain text from Microsoft PowerPoint (.pptx) presentation files
 * by unzipping the OOXML structure and harvesting slide text nodes (<a:t>).
 */
export async function extractTextFromPptx(buffer: Buffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const slideFiles = zip.file(/^ppt\/slides\/slide\d+\.xml$/);

    if (!slideFiles || slideFiles.length === 0) {
      return "No text content found in PPTX slides.";
    }

    // Sort slide files numerically (slide1.xml, slide2.xml, etc.)
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.name.match(/\d+/)?.[0] || "0", 10);
      const numB = parseInt(b.name.match(/\d+/)?.[0] || "0", 10);
      return numA - numB;
    });

    const slideTexts: string[] = [];

    for (let i = 0; i < slideFiles.length; i++) {
      const xml = await slideFiles[i].async("string");
      // Match text contents inside PowerPoint drawing text (<a:t>) tags
      const matches = xml.match(/<a:t[^>]*>(.*?)<\/a:t>/g) || [];
      const textParts = matches
        .map((m) => m.replace(/<[^>]+>/g, "").trim())
        .filter(Boolean);

      if (textParts.length > 0) {
        slideTexts.push(`--- Slide ${i + 1} ---\n` + textParts.join(" "));
      }
    }

    return slideTexts.join("\n\n");
  } catch (err: any) {
    console.error("Error parsing PPTX presentation:", err);
    throw new Error(`Failed to extract text from PPTX presentation: ${err?.message || "Invalid or corrupted file format"}`);
  }
}
