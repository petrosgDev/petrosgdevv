import { NextRequest, NextResponse } from 'next/server';
import { getDefaultPortfolioBundle, type PortfolioBundle } from '@/data/portfolio';
import { getPublishedPortfolioServer } from '@/lib/serverPortfolio';
import {
  answerPortfolioQuestion,
  buildPortfolioSystemPrompt,
  type AssistantHistoryTurn,
  type AssistantReply,
} from '@/lib/portfolioAssistant';

export const dynamic = 'force-dynamic';

async function tryOptionalLlmAnswer(
  question: string,
  history: AssistantHistoryTurn[],
  bundle: PortfolioBundle
): Promise<string | null> {
  const systemPrompt = buildPortfolioSystemPrompt(bundle);
  const geminiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim();
  const openaiKey =
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.AI_GATEWAY_API_KEY?.trim();

  if (geminiKey) {
    try {
      const contents = [
        ...history.slice(-8).map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        { role: 'user', parts: [{ text: question }] },
      ];

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 480,
            },
          }),
        }
      );

      if (res.ok) {
        const json = (await res.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
      }
    } catch {
      // Fall back seamlessly to local grounded engine
    }
  }

  if (openaiKey) {
    try {
      const endpoint = process.env.AI_GATEWAY_API_KEY?.trim()
        ? 'https://ai-gateway.vercel.sh/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const model = process.env.AI_GATEWAY_API_KEY?.trim()
        ? 'openai/gpt-4o-mini'
        : 'gpt-4o-mini';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          model,
          temperature: 0.3,
          max_tokens: 480,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.slice(-8),
            { role: 'user', content: question },
          ],
        }),
      });

      if (res.ok) {
        const json = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = json.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch {
      // Fall back seamlessly to local grounded engine
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      question?: unknown;
      history?: unknown;
    } | null;

    const question =
      typeof body?.question === 'string' ? body.question.trim().slice(0, 600) : '';

    if (!question) {
      return NextResponse.json(
        { error: 'Please enter a question about Petros Geto.' },
        { status: 400 }
      );
    }

    const rawHistory = Array.isArray(body?.history) ? body.history : [];
    const history: AssistantHistoryTurn[] = rawHistory
      .slice(-10)
      .filter(
        (item): item is AssistantHistoryTurn =>
          Boolean(item) &&
          typeof item === 'object' &&
          ((item as AssistantHistoryTurn).role === 'user' ||
            (item as AssistantHistoryTurn).role === 'assistant') &&
          typeof (item as AssistantHistoryTurn).content === 'string'
      )
      .map((item) => ({
        role: item.role,
        content: item.content.slice(0, 1000),
      }));

    const snapshot = await getPublishedPortfolioServer();
    const bundle = snapshot?.data ?? getDefaultPortfolioBundle();

    // Always compute contextual links and follow-ups via grounded engine
    const engineReply = answerPortfolioQuestion(question, bundle, history);
    const llmAnswer = await tryOptionalLlmAnswer(question, history, bundle);

    const payload: AssistantReply = llmAnswer
      ? {
          answer: llmAnswer,
          links: engineReply.links,
          followUps: engineReply.followUps,
          mode: 'llm',
        }
      : engineReply;

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch (error) {
    console.error('Assistant API error:', error);
    return NextResponse.json(
      { error: 'Unable to answer right now. Please try again.' },
      { status: 500 }
    );
  }
}
