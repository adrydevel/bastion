import OpenAI from "openai";
export class HermesProvider {
    model;
    client;
    constructor(model = "Hermes-4-70B", baseURL = process.env.BASTION_BASE_URL ?? "https://inference-api.nousresearch.com/v1") {
        this.model = model;
        this.client = new OpenAI({
            apiKey: process.env.BASTION_API_KEY ?? "nous-local",
            baseURL,
        });
    }
    async reason(system, user) {
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
