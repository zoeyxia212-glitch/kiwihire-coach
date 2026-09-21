const MAX_FILE_SIZE = 10 * 1024 * 1024;

export type ParsedDocumentFile = {
  suggestedName: string;
  text: string;
};

export async function parseDocumentFile(
  file: File,
): Promise<ParsedDocumentFile> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File must be smaller than 10 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  let text = "";

  if (extension === "txt") {
    text = await file.text();
  } else if (extension === "docx") {
    const { default: mammoth } = await import("mammoth");
    const result = await mammoth.extractRawText({
      arrayBuffer: await file.arrayBuffer(),
    });
    text = result.value;
  } else if (extension === "pdf") {
    text = await extractPdfText(await file.arrayBuffer());
  } else {
    throw new Error("Choose a PDF, DOCX, or TXT file.");
  }

  const normalizedText = text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!normalizedText) {
    throw new Error(
      "No readable text was found. Scanned PDFs may need OCR.",
    );
  }

  return {
    suggestedName: file.name.replace(/\.[^.]+$/, ""),
    text: normalizedText,
  };
}

async function extractPdfText(arrayBuffer: ArrayBuffer) {
  const [pdfjs, workerModule] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default;

  const document = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = joinPdfTextFragments(content.items).trim();

    if (pageText) {
      pages.push(pageText);
    }
  }

  return pages.join("\n\n");
}

type PdfTextFragment = {
  str: string;
  transform: number[];
  width: number;
  hasEOL: boolean;
};

function isPdfTextFragment(item: unknown): item is PdfTextFragment {
  return (
    typeof item === "object" &&
    item !== null &&
    "str" in item &&
    "transform" in item &&
    Array.isArray((item as { transform: unknown }).transform)
  );
}

// A gap narrower than this fraction of the previous fragment's font size
// reads as adjacent glyphs (kerning, or a letter-spaced/tracked word),
// not a real word boundary.
const WORD_GAP_RATIO = 0.15;

/**
 * Reconstructs readable text from pdf.js's getTextContent() items.
 *
 * pdf.js often splits a page's text into fragments that don't line up
 * with word boundaries - PDFs built with letter-spaced or tracked
 * headings (common in resume templates, for the candidate's name and
 * section titles like "PROFESSIONAL PROFILE") frequently come back as
 * one fragment per glyph. Naively joining every fragment with a single
 * space - the previous implementation - turned "PROFESSIONAL PROFILE"
 * into "P R O F E S S I O N A L P R O F I L E".
 *
 * This instead compares the horizontal gap between consecutive
 * same-line fragments to their font size: a small gap (adjacent glyphs
 * of a tracked word) stays joined with no space, while a gap wide
 * enough to be a real word boundary gets one. A vertical shift starts a
 * new line, which also means resume text extracted from a PDF now keeps
 * its original line breaks instead of being flattened into one long
 * line per page.
 */
export function joinPdfTextFragments(items: ReadonlyArray<unknown>): string {
  let result = "";
  let previous: PdfTextFragment | null = null;

  for (const raw of items) {
    if (!isPdfTextFragment(raw)) {
      continue;
    }

    if (raw.str) {
      if (previous) {
        const previousX = previous.transform[4];
        const previousY = previous.transform[5];
        const x = raw.transform[4];
        const y = raw.transform[5];
        const sameLine = Math.abs(y - previousY) < 2;

        if (!sameLine) {
          result += "\n";
        } else {
          const scale =
            Math.hypot(previous.transform[0], previous.transform[1]) || 1;
          const gap = x - (previousX + previous.width);
          if (gap > scale * WORD_GAP_RATIO) {
            result += " ";
          }
        }
      }

      result += raw.str;
      previous = raw;
    }

    if (raw.hasEOL) {
      result += "\n";
      previous = null;
    }
  }

  return result;
}
