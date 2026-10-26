import {
  maxFormBodyBytes,
  maxRequestsPerWindow,
  rateLimitWindowMs,
} from "@/app/api/_lib/validation";
import { locales, siteConfig } from "@/lib/site";

const consentSchema = {
  description:
    "Explicit consent. JSON clients should send true; native form values 'true' and 'on' are also accepted.",
  oneOf: [
    { const: true, type: "boolean" },
    { enum: ["true", "on"], type: "string" },
  ],
} as const;

const commonFormProperties = {
  consent: consentSchema,
  locale: { $ref: "#/components/schemas/Locale" },
  path: { maxLength: 300, type: "string" },
  source: { maxLength: 100, type: "string" },
  utm_campaign: { maxLength: 200, type: "string" },
  utm_content: { maxLength: 200, type: "string" },
  utm_medium: { maxLength: 200, type: "string" },
  utm_source: { maxLength: 200, type: "string" },
  utm_term: { maxLength: 200, type: "string" },
  website: {
    description:
      "Honeypot field. Human clients should omit this field or send an empty string.",
    maxLength: 500,
    type: "string",
  },
} as const;

function jsonResponse(description: string, schemaRef: string) {
  return {
    content: {
      "application/json": {
        schema: { $ref: schemaRef },
      },
    },
    description,
  };
}

function statusOperation(target: "contact" | "waitlist") {
  return {
    description:
      "Reports whether the server-side forwarding destination for this form is configured. No private destination data is returned.",
    operationId: `get${target === "contact" ? "Contact" : "Waitlist"}FormStatus`,
    responses: {
      "200": jsonResponse(
        "The form forwarding destination is configured.",
        "#/components/schemas/FormStatus",
      ),
      "503": jsonResponse(
        "The form forwarding destination is unavailable.",
        "#/components/schemas/FormStatus",
      ),
    },
    summary: `${target === "contact" ? "Contact" : "Waitlist"} form status`,
    tags: ["Forms"],
  };
}

function submissionOperation(
  target: "contact" | "waitlist",
  schemaRef: string,
) {
  const label = target === "contact" ? "contact message" : "waitlist application";

  return {
    description: `Validates and forwards a public ${label}. Request bodies are limited to ${maxFormBodyBytes} bytes. The current process allows ${maxRequestsPerWindow} requests per client during each ${rateLimitWindowMs / 60_000}-minute window.`,
    operationId: `submit${target === "contact" ? "Contact" : "Waitlist"}Form`,
    requestBody: {
      content: {
        "application/json": {
          schema: { $ref: schemaRef },
        },
      },
      required: true,
    },
    responses: {
      "200": jsonResponse(
        "The submission was accepted. Honeypot submissions also receive this neutral response.",
        "#/components/schemas/SuccessResponse",
      ),
      "400": jsonResponse(
        "The request body is invalid JSON or fails validation.",
        "#/components/schemas/ErrorResponse",
      ),
      "413": jsonResponse(
        "The request body exceeds the public payload limit.",
        "#/components/schemas/ErrorResponse",
      ),
      "429": jsonResponse(
        "The client exceeded the current per-process request budget.",
        "#/components/schemas/ErrorResponse",
      ),
      "502": jsonResponse(
        "The public submission could not be delivered to the configured destination.",
        "#/components/schemas/ErrorResponse",
      ),
      "503": jsonResponse(
        "The form forwarding destination is not configured.",
        "#/components/schemas/ErrorResponse",
      ),
    },
    summary: `Submit a ${label}`,
    tags: ["Forms"],
  };
}

export const openApiDocument = {
  components: {
    schemas: {
      ContactRequest: {
        properties: {
          ...commonFormProperties,
          email: { format: "email", maxLength: 320, type: "string" },
          message: { maxLength: 3000, minLength: 10, type: "string" },
          name: { maxLength: 160, minLength: 2, type: "string" },
          subject: { maxLength: 180, minLength: 2, type: "string" },
        },
        required: ["consent", "email", "message", "name", "subject"],
        type: "object",
      },
      ErrorResponse: {
        additionalProperties: false,
        properties: {
          code: {
            enum: [
              "INVALID_JSON",
              "PAYLOAD_TOO_LARGE",
              "RATE_LIMITED",
              "VALIDATION_FAILED",
              "FORM_ENDPOINT_MISSING",
              "FORM_FORWARD_FAILED",
            ],
            type: "string",
          },
          ok: { const: false, type: "boolean" },
        },
        required: ["code", "ok"],
        type: "object",
      },
      FormStatus: {
        additionalProperties: false,
        properties: {
          configured: { type: "boolean" },
          ok: { type: "boolean" },
          target: { enum: ["contact", "waitlist"], type: "string" },
        },
        required: ["configured", "ok", "target"],
        type: "object",
      },
      Locale: {
        enum: [...locales],
        type: "string",
      },
      SuccessResponse: {
        additionalProperties: false,
        properties: {
          ok: { const: true, type: "boolean" },
        },
        required: ["ok"],
        type: "object",
      },
      WaitlistRequest: {
        properties: {
          ...commonFormProperties,
          building_type: { maxLength: 500, type: "string" },
          country: { maxLength: 500, type: "string" },
          email: { format: "email", maxLength: 320, type: "string" },
          interest_type: { maxLength: 120, type: "string" },
          message: { maxLength: 3000, type: "string" },
          name: { maxLength: 500, type: "string" },
          number_of_buildings: {
            oneOf: [
              { maximum: 100000, minimum: 0, type: "integer" },
              { pattern: "^[0-9]+$", type: "string" },
            ],
          },
          organization: { maxLength: 500, type: "string" },
          role: { maxLength: 500, type: "string" },
        },
        required: ["consent", "email"],
        type: "object",
      },
    },
  },
  info: {
    description:
      "Public status and submission contract for SismoSmart website forms. The contract intentionally omits private forwarding and infrastructure details.",
    title: "SismoSmart public form API",
    version: "1.0.0",
  },
  jsonSchemaDialect: "https://json-schema.org/draft/2020-12/schema",
  openapi: "3.1.0",
  paths: {
    "/api/contact": {
      get: statusOperation("contact"),
      post: submissionOperation("contact", "#/components/schemas/ContactRequest"),
    },
    "/api/waitlist": {
      get: statusOperation("waitlist"),
      post: submissionOperation("waitlist", "#/components/schemas/WaitlistRequest"),
    },
  },
  servers: [{ url: siteConfig.url }],
  tags: [
    {
      description: "Public website form status and submission endpoints.",
      name: "Forms",
    },
  ],
} as const;
