import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

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
  const document = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .trim();

    if (pageText) {
      pages.push(pageText);
    }
  }

  return pages.join("\n\n");
}
