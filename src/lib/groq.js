import Groq from "groq-sdk";
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});


export async function generateSummary(chunks) {
    try {
        const combinedText = chunks.join('\n\n').slice(0, 32000);

        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that creates concise but comprehensive summaries of documents."
                },
                {
                    role: "user",
                    content: `Please create a well-structured summary of the following document content. Focus on the key points, main arguments, and important conclusions. The summary should be comprehensive yet concise.\n\n${combinedText}`
                }
            ],
            model: "llama3-70b-8192",
            temperature: 0.3,
            max_tokens: 2048,
        });

        return response.choices[0].message.content || "Failed to generate summary.";
    } catch (error) {
        console.error('Error generating summary:', error);
        throw new Error('Failed to generate summary');
    }
}