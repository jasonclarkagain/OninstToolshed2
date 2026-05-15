import OpenAI from 'openai';
import type { OsintQuery } from '@shared/schema';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIInsight {
  id: string;
  type: 'vulnerability' | 'pattern' | 'recommendation' | 'correlation' | 'threat';
  confidence: number;
  title: string;
  description: string;
  evidence: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  relatedQueries: number[];
  timestamp: string;
}

export interface AIAnalysisResult {
  summary: string;
  insights: AIInsight[];
  overallRiskScore: number;
  priorityActions: string[];
  correlations: {
    queryId1: number;
    queryId2: number;
    correlation: string;
    confidence: number;
  }[];
}

export class AIService {
  async analyzeSecurityData(queries: OsintQuery[]): Promise<AIAnalysisResult> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const analysisPrompt = this.buildAnalysisPrompt(queries);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert cybersecurity analyst specializing in OSINT (Open Source Intelligence) data analysis. 
            Analyze the provided security data and identify patterns, vulnerabilities, correlations, and provide actionable recommendations.
            Always respond with valid JSON in the specified format.`
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const analysisResult = JSON.parse(response.choices[0].message.content!);
      
      return {
        summary: analysisResult.summary,
        insights: analysisResult.insights.map((insight: any, index: number) => ({
          id: `ai-${Date.now()}-${index}`,
          type: insight.type,
          confidence: Math.min(100, Math.max(0, insight.confidence)),
          title: insight.title,
          description: insight.description,
          evidence: insight.evidence || [],
          impact: insight.impact,
          recommendations: insight.recommendations || [],
          relatedQueries: insight.relatedQueries || [],
          timestamp: new Date().toISOString()
        })),
        overallRiskScore: Math.min(100, Math.max(0, analysisResult.overallRiskScore)),
        priorityActions: analysisResult.priorityActions || [],
        correlations: analysisResult.correlations || []
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw new Error('AI analysis service temporarily unavailable');
    }
  }

  async processNaturalLanguageQuery(query: string, osintData: OsintQuery[]): Promise<{
    interpretation: string;
    suggestedActions: string[];
    relevantFindings: any[];
    confidence: number;
  }> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that interprets natural language security queries and maps them to OSINT data analysis.
            Analyze the user's question and provide interpretation, suggested actions, and relevant findings from the available data.
            Respond with valid JSON.`
          },
          {
            role: "user",
            content: `
            User Query: "${String(query).slice(0, 500)}"
            
            Available OSINT Data: ${JSON.stringify(osintData.slice(0, 10).map(q => ({ id: q.id, toolType: q.toolType, query: String(q.query ?? '').slice(0, 200), status: q.status })), null, 2)}
            
            Please interpret this query and provide:
            1. What the user is asking for
            2. Suggested actions to answer their question
            3. Any relevant findings from the data
            4. Confidence level (0-100)
            
            Format as JSON: {
              "interpretation": "string",
              "suggestedActions": ["action1", "action2"],
              "relevantFindings": [],
              "confidence": number
            }`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content!);
    } catch (error) {
      console.error('Natural language processing failed:', error);
      throw new Error('Natural language processing temporarily unavailable');
    }
  }

  async generateSecurityRecommendations(findings: any[]): Promise<{
    recommendations: string[];
    priorityLevel: 'low' | 'medium' | 'high' | 'critical';
    estimatedEffort: string;
    timeline: string;
  }> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a cybersecurity expert providing actionable security recommendations based on OSINT findings.
            Provide specific, prioritized recommendations with implementation guidance.`
          },
          {
            role: "user",
            content: `
            Security Findings: ${JSON.stringify(findings, null, 2)}
            
            Please provide security recommendations in JSON format:
            {
              "recommendations": ["specific actionable recommendations"],
              "priorityLevel": "low|medium|high|critical",
              "estimatedEffort": "description of effort required",
              "timeline": "suggested implementation timeline"
            }`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content!);
    } catch (error) {
      console.error('Recommendation generation failed:', error);
      throw new Error('Recommendation service temporarily unavailable');
    }
  }

  private buildAnalysisPrompt(queries: OsintQuery[]): string {
    const MAX_QUERIES = 20;
    const MAX_FIELD_LEN = 200;
    const queryData = queries.slice(0, MAX_QUERIES).map(q => ({
      id: q.id,
      toolType: q.toolType,
      query: String(q.query ?? '').slice(0, MAX_FIELD_LEN),
      status: q.status,
    }));

    return `
    Analyze the following OSINT data and provide a comprehensive security analysis:

    OSINT Queries Data:
    ${JSON.stringify(queryData, null, 2)}

    Please provide analysis in the following JSON format:
    {
      "summary": "Executive summary of findings",
      "insights": [
        {
          "type": "vulnerability|pattern|recommendation|correlation|threat",
          "confidence": 85,
          "title": "Insight title",
          "description": "Detailed description",
          "evidence": ["evidence1", "evidence2"],
          "impact": "low|medium|high|critical",
          "recommendations": ["recommendation1", "recommendation2"],
          "relatedQueries": [1, 2, 3]
        }
      ],
      "overallRiskScore": 75,
      "priorityActions": ["action1", "action2"],
      "correlations": [
        {
          "queryId1": 1,
          "queryId2": 2,
          "correlation": "description",
          "confidence": 80
        }
      ]
    }

    Focus on:
    1. Security vulnerabilities and misconfigurations
    2. Patterns indicating potential threats
    3. Cross-query correlations and relationships
    4. Actionable recommendations for improvement
    5. Risk assessment and prioritization
    `;
  }
}

export const aiService = new AIService();