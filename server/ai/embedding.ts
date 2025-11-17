import { VECTOR_DIMENSIONS } from '@/lib/db/schema';
import { google } from '@ai-sdk/google';
import { embed } from 'ai';


export const getTextEmbedding = async (text: string) => {
    const model = google.textEmbedding('gemini-embedding-001');

    const { embedding } = await embed({
    model,
    value: text,
    providerOptions: {
        google: {
        outputDimensionality: VECTOR_DIMENSIONS, // optional, number of dimensions for the embedding
        },
    },
    });

    return embedding;
}