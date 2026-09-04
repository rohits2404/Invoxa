import OpenAI from "openai";
import { z } from "zod";

import env from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

import { pdf } from "pdf-to-img";

const client = env.groqApiKey
    ? new OpenAI({
          apiKey: env.groqApiKey,
          baseURL: "https://api.groq.com/openai/v1",
      })
    : null;

// Text-generation model.
// Good fit for summaries, reminders, notes, etc.
const TEXT_MODEL = env.groqModel || "openai/gpt-oss-20b";

// Vision model.
// Used for receipt/image extraction.
const VISION_MODEL = env.groqVisionModel || "qwen/qwen3.6-27b";

function requireAI() {
    if (!client) {
        throw ApiError.internal(
            "GROQ_API_KEY is not configured on the server.",
        );
    }

    return client;
}

/**
 * Generate plain text using Groq.
 */
async function generateText({ input, model = TEXT_MODEL, temperature = 0.5 }) {
    const ai = requireAI();

    const response = await ai.responses.create({
        model,
        input,
        temperature,
    });

    const text = response.output_text?.trim();

    if (!text) {
        throw new Error("Empty response from Groq");
    }

    return text;
}

/**
 * Receipt schema used by Zod after Groq returns JSON.
 */
const receiptValidator = z.object({
    vendor: z.string().default(""),
    date: z.string().default(""),
    currency: z.string().default(""),
    subtotal: z.coerce.number().default(0),
    tax: z.coerce.number().default(0),
    total: z.coerce.number().default(0),
    category: z.string().default(""),
    notes: z.string().default(""),
    lineItems: z
        .array(
            z.object({
                description: z.string().default(""),
                quantity: z.coerce.number().default(1),
                rate: z.coerce.number().default(0),
            }),
        )
        .default([]),
});

function validateReceiptResponse(text) {
    let parsed;

    try {
        parsed = JSON.parse(text);
    } catch (error) {
        throw new Error(`Groq returned invalid receipt JSON: ${error.message}`);
    }

    return receiptValidator.parse(parsed);
}

/**
 * Extract structured receipt data from an IMAGE.
 *
 * Groq's Qwen vision model supports image input and JSON mode.
 */
async function parseReceipt({ buffer, mimeType }) {
    const ai = requireAI();

    const prompt = `
Extract this receipt or invoice into exactly one JSON object.

Schema:
{
  "vendor": "",
  "date": "",
  "currency": "",
  "subtotal": 0,
  "tax": 0,
  "total": 0,
  "category": "",
  "notes": "",
  "lineItems": [
    {
      "description": "",
      "quantity": 1,
      "rate": 0
    }
  ]
}

Rules:
- Read values directly from the document.
- Do not invent or guess values.
- Missing string values = "".
- Missing numeric values = 0.
- If quantity is not shown, use 1.
- "rate" means unit price.
- "total" means the final amount charged.
- Date must be YYYY-MM-DD when visible.
- Currency must be a 3-letter code when visible.
- Return ONLY valid JSON.
`.trim();

    /*
     * ---------------------------------------------------------
     * IMAGE
     * ---------------------------------------------------------
     */
    if (mimeType?.startsWith("image/")) {
        const base64Image = buffer.toString("base64");

        const response = await ai.chat.completions.create({
            model: VISION_MODEL,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt,
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`,
                            },
                        },
                    ],
                },
            ],
            response_format: {
                type: "json_object",
            },
            reasoning_effort: "none",
            temperature: 0.1,
            max_completion_tokens: 700,
        });

        const text = response.choices?.[0]?.message?.content;

        if (!text) {
            throw new Error("Empty receipt response from Groq");
        }

        return validateReceiptResponse(text);
    }

    /*
     * ---------------------------------------------------------
     * PDF
     * ---------------------------------------------------------
     */
    if (mimeType === "application/pdf") {
        const document = await pdf(buffer, {
            scale: 2.5,
        });

        const images = [];

        // Limit pages to avoid sending an enormous PDF to Groq.
        const MAX_PAGES = 5;

        for await (const image of document) {
            images.push(image);

            if (images.length >= MAX_PAGES) {
                break;
            }
        }

        if (!images.length) {
            throw new Error("Could not convert PDF into images");
        }

        /*
         * Groq allows multiple images in a vision request.
         * We send up to 5 PDF pages together.
         */
        const content = [
            {
                type: "text",
                text:
                    prompt +
                    `\n\nThis document may contain multiple pages. Combine information from all pages into one receipt/invoice JSON object.`,
            },
        ];

        for (const imageBuffer of images) {
            content.push({
                type: "image_url",
                image_url: {
                    url: `data:image/png;base64,${imageBuffer.toString("base64")}`,
                },
            });
        }

        const response = await ai.chat.completions.create({
            model: VISION_MODEL,
            messages: [
                {
                    role: "user",
                    content,
                },
            ],
            response_format: {
                type: "json_object",
            },
            reasoning_effort: "none",
            temperature: 0.1,
            max_completion_tokens: 700,
        });

        const text = response.choices?.[0]?.message?.content;

        if (!text) {
            throw new Error("Empty receipt response from Groq");
        }

        return validateReceiptResponse(text);
    }

    /*
     * ---------------------------------------------------------
     * UNSUPPORTED FILE
     * ---------------------------------------------------------
     */

    throw ApiError.badRequest(
        "Unsupported receipt file type. Please upload an image or PDF.",
    );
}

/**
 * Generate a business summary.
 */
async function businessSummary(data) {
    const prompt = [
        "You are a friendly financial analyst for a small business owner.",
        "Given this month's billing data (JSON), write a concise 2-3 sentence plain-English summary.",
        "Mention revenue trend vs last month with a percentage if computable, count and dollar total of overdue invoices.",
        "Include one actionable suggestion, such as following up with a specific client.",
        "Be specific with numbers.",
        "No markdown.",
        "No bullet points.",
        "",
        "DATA:",
        JSON.stringify(data),
    ].join("\n");

    return generateText({
        input: prompt,
        model: TEXT_MODEL,
        temperature: 0.5,
    });
}

/**
 * Generate a payment reminder email.
 */
async function paymentReminder({
    tone,
    invoice,
    client,
    company,
    daysOverdue,
}) {
    const toneGuide =
        tone === "firm"
            ? "firm but professional - this invoice is significantly overdue"
            : tone === "final"
              ? "serious and direct - a final notice before escalation, still courteous"
              : "warm, polite and friendly - a gentle nudge";

    const prompt = [
        `Write a payment reminder email. Tone: ${toneGuide}.`,
        "Return a short subject line, then a blank line, then the email body.",
        "Use the merchant/company name as the signature.",
        "Keep it under 130 words.",
        "Plain text only.",
        "No markdown.",
        "",
        "CONTEXT:",
        JSON.stringify({
            invoice,
            client,
            company,
            daysOverdue,
        }),
    ].join("\n");

    const text = await generateText({
        input: prompt,
        model: TEXT_MODEL,
        temperature: 0.6,
    });

    const trimmed = text.trim();

    const nl = trimmed.indexOf("\n");

    let subject = "";
    let body = trimmed;

    if (nl > -1) {
        subject = trimmed
            .slice(0, nl)
            .replace(/^subject:\s*/i, "")
            .trim();

        body = trimmed.slice(nl + 1).trim();

        // Remove an optional blank line between subject and body.
        body = body.replace(/^\s*\n/, "").trim();
    }

    return {
        subject,
        body,
    };
}

/**
 * Generate invoice notes or service descriptions.
 */
async function writeNote({ kind, prompt, items, client }) {
    const target =
        kind === "terms"
            ? "professional payment-terms / notes text for the bottom of an invoice"
            : "a concise, professional service description for an invoice line item or summary";

    const full = [
        `Write ${target}.`,
        prompt ? `The user's request: ${prompt}` : "",
        "Keep it polished and brief (1-3 sentences).",
        "Plain text only.",
        "No markdown.",
        "No preamble.",
        items?.length ? `Line items for context: ${JSON.stringify(items)}` : "",
        client ? `Client: ${JSON.stringify(client)}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    return generateText({
        input: full,
        model: TEXT_MODEL,
        temperature: 0.7,
    });
}

export { parseReceipt, businessSummary, paymentReminder, writeNote };
