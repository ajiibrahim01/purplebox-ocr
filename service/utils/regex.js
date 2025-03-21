const regex = (text) => {
  const cleanedText = text.replace(/\s+/g, " "); // Normalize whitespace

  return {
    invoiceNumber:
      cleanedText.match(
        /(?:invoice\s*#?|inv\.?)\s*([A-Z0-9]{2,}-?[A-Z0-9]{3,})/i
      )?.[1] || null,
    orderNumber:
      cleanedText.match(
        /(?:purchase\s*order|po|order\s*#?)\s*([A-Z0-9]{3,}-?[A-Z0-9]{3,})/i
      )?.[1] || null,
    dates: [
      ...new Set(
        (
          cleanedText.match(
            /(?:\b\d{1,2}[\/\-]\d{1,2}[\/\-](?:19|20)\d{2}\b)|(?:\b(?:19|20)\d{2}[\/\-]\d{2}[\/\-]\d{2}\b)|(?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+(?:19|20)\d{2}\b)/gi
          ) || []
        )
          .map((date) => new Date(date).toISOString().split("T")[0]) // Normalize dates
          .filter((d) => !isNaN(new Date(d).getTime())) // Validate dates
      ),
    ],
    amounts: {
      total:
        cleanedText.match(
          /(?:(?:total|balance)\s+(?:due|amount)|amount\s+due)\s*[:-]?\s*([$\€\£]?\s*\d{1,3}(?:,\d{3})*\.\d{2})\b/i
        )?.[1] || null,
      tax:
        cleanedText.match(
          /(?:(?:tax|vat)\s+amount)\s*[:-]?\s*([$\€\£]?\s*\d{1,3}(?:,\d{3})*\.\d{2})\b/i
        )?.[1] || null,
      subtotal:
        cleanedText.match(
          /(?:sub-?total)\s*[:-]?\s*([$\€\£]?\s*\d{1,3}(?:,\d{3})*\.\d{2})\b/i
        )?.[1] || null,
      discount:
        cleanedText.match(
          /(?:discount)\s*[:-]?\s*([$\€\£]?\s*\d{1,3}(?:,\d{3})*\.\d{2})\b/i
        )?.[1] || null,
    },
    documentType:
      cleanedText.match(
        /(Invoice|Receipt|Proforma|Contract|Statement|Quote|Report)/i
      )?.[1] || "Unknown",
    paymentTerms:
      cleanedText.match(
        /(?:payment\s+terms?)\s*[:-]?\s*(\d+\s+days?|NET\s+\d+|Upon\s+Receipt)/i
      )?.[1] || null,
    dueDate:
      cleanedText.match(
        /(?:due\s+date|date\s+due)\s*[:-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-](?:19|20)\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+(?:19|20)\d{2})/gi
      )?.[0] || null,
    iban:
      cleanedText.match(
        /\b[A-Z]{2}\d{2}[\s\-]?(?:[A-Z0-9]{4}[\s\-]?){3,}[A-Z0-9]{1,4}\b/gi
      )?.[0] || null,
  };
};

export default regex;
