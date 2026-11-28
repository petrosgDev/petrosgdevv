import { NextRequest, NextResponse } from 'next/server';
import { getDefaultPortfolioBundle } from '@/data/portfolio';
import { getPublishedPortfolioServer } from '@/lib/serverPortfolio';
import {
  classifyGeminiError,
  GEMINI_ASSISTANT_MODEL,
  getGeminiApiKey,
  getGeminiClient,
  PORTFOLIO_ASSISTANT_RESPONSE_SCHEMA,
  ThinkingLevel,
  withExponentialBackoff,
} from '@/lib/gemini';
import {
  answerPortfolioQuestion,
  buildGeminiConversationContents,
  buildPortfolioSystemPrompt,
  normalizeGeminiAssistantReply,
  parseStructuredGeminiJson,
  type AssistantHistoryTurn,
  type AssistantReply,
} from '@/lib/portfolioAssistant';

export const dynamic = 'force-dynamic';

const RESPONSE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

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
        { status: 400, headers: RESPONSE_HEADERS }
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

    // When GEMINI_API_KEY is not configured in the environment, serve the deterministic
    // grounded portfolio index explicitly (mode: 'portfolio-engine') so the portfolio Q&A
    // stays functional. When GEMINI_API_KEY IS configured, always use Gemini and surface
    // any real upstream API errors transparently.
    if (!getGeminiApiKey()) {
      const groundedReply = answerPortfolioQuestion(question, bundle, history);
      return NextResponse.json(groundedReply, {
        status: 200,
        headers: RESPONSE_HEADERS,
      });
    }

    const ai = getGeminiClient();
    const systemInstruction = buildPortfolioSystemPrompt(bundle);
    const contents = buildGeminiConversationContents(history, question);

    const response = await withExponentialBackoff(() =>
      ai.models.generateContent({
        model: GEMINI_ASSISTANT_MODEL,
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: PORTFOLIO_ASSISTANT_RESPONSE_SCHEMA,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      })
    );

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      return NextResponse.json(
        { error: 'The assistant returned an empty response. Please try again.' },
        { status: 502, headers: RESPONSE_HEADERS }
      );
    }

    const parsed = parseStructuredGeminiJson(rawText);
    const payload: AssistantReply = parsed
      ? normalizeGeminiAssistantReply(parsed, bundle, question)
      : normalizeGeminiAssistantReply(
          {
            answer: rawText,
            offTopic: false,
            referencedProjectSlugs: [],
            includeWorkLink: true,
          },
          bundle,
          question
        );

    return NextResponse.json(payload, {
      status: 200,
      headers: RESPONSE_HEADERS,
    });
  } catch (error) {
    const classified = classifyGeminiError(error);
    console.error('Assistant API error:', error);
    return NextResponse.json(
      { error: classified.message, code: classified.code },
      { status: classified.status, headers: RESPONSE_HEADERS }
    );
  }
}
