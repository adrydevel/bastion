import OpenAI from "openai";

// Bastion's reasoning runs on Nous Research's Hermes models through an
// OpenAI-compatible endpoint. Any compatible provider can be swapped in via
// BASTION_BASE_URL / BASTION_API_KEY, but Hermes is the default because it is
// open-weights and its tool-use / function-calling behaviour is deterministic
// enough for a policy-gated agent.
export interface LLM {
  reason(system: string, user: string): Promise<string>;
}

export class HermesProvider implements LLM {
  private client: OpenAI;
  constructor(
    private readonly model = "Hermes-4-70B",
    baseURL = process.env.BASTION_BASE_URL ?? "https://inference-api.nousresearch.com/v1",
  ) {
    this.client = new OpenAI({
      apiKey: process.env.BASTION_API_KEY ?? "nous-local",
      baseURL,
    });
  }

  async reason(system: string, user: string): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    return res.choices[0]?.message?.content ?? "";
  }
}
