import { NextRequest, NextResponse } from "next/server";
import { createWorker } from "tesseract.js";

// Basic regex to find amounts (e.g., 12.345, 12,345.00)
const amountRegex = /total|total\s*bayar|tunai|tagihan[\s\S]*?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/i;

// Basic regex for dates (e.g., 24/05/2024, 24-05-2024)
const dateRegex = /(\d{2}[\/\-.]\d{2}[\/\-.]\d{2,4})/;

async function parseText(text: string) {
  let amount: number | null = null;
  let date: Date | null = null;

  const amountMatch = text.match(amountRegex);
  if (amountMatch && amountMatch[1]) {
    const cleanedAmount = amountMatch[1].replace(/[.,](\d{2})$/, ".$1").replace(/[.,]/g, "");
    amount = parseFloat(cleanedAmount);
  }

  const dateMatch = text.match(dateRegex);
  if (dateMatch && dateMatch[1]) {
    // Attempt to parse various date formats
    const dateStr = dateMatch[1].replace(/[\/\-]/g, '/');
    // DD/MM/YYYY or DD/MM/YY
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        let year = parseInt(parts[2], 10);
        if (year < 100) {
            year += 2000; // Assume 21st century
        }
        const parsedDate = new Date(year, month, day);
        if (!isNaN(parsedDate.getTime())) {
            date = parsedDate;
        }
    }
  }

  return { amount, date, description: `Receipt processed on ${new Date().toLocaleDateString()}` };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("receipt") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await file.arrayBuffer());

    const worker = await createWorker('ind'); // Specify Indonesian language
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();

    const extractedData = await parseText(text);

    return NextResponse.json(extractedData, { status: 200 });

  } catch (error) {
    console.error("OCR Error:", error);
    return NextResponse.json({ error: "Failed to process receipt." }, { status: 500 });
  }
}
