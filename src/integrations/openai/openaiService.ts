
import OpenAI from 'openai';
import { config } from '../../config/config';

class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * 生成文字回應
   */
  async generateResponse(prompt: string, systemMessage?: string): Promise<string> {
    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'user',
          content: prompt
        }
      ];

      if (systemMessage) {
        messages.unshift({
          role: 'system',
          content: systemMessage
        });
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || '抱歉，我無法生成回應。';
    } catch (error) {
      console.error('OpenAI API 錯誤:', error);
      throw new Error('AI 服務暫時無法使用');
    }
  }

  /**
   * 分析文字情感
   */
  async analyzeSentiment(text: string): Promise<string> {
    const prompt = `請分析以下文字的情感傾向，回答「正面」、「負面」或「中性」：\n\n${text}`;
    return await this.generateResponse(prompt);
  }

  /**
   * 生成活動建議
   */
  async generateEventSuggestion(theme: string): Promise<string> {
    const systemMessage = '你是北大獅子會的活動策劃助理，請根據主題生成具體的活動建議。';
    const prompt = `請為「${theme}」主題設計一個獅子會活動，包括活動內容、時間安排、參與方式等建議。`;
    return await this.generateResponse(prompt, systemMessage);
  }

  /**
   * 智能回覆 LINE 訊息
   */
  async generateLineReply(userMessage: string, context?: string): Promise<string> {
    const systemMessage = '你是北大獅子會的 LINE Bot 助理，請以友善、專業的語調回覆會員訊息。';
    const prompt = context 
      ? `使用者訊息：${userMessage}\n背景資訊：${context}\n請生成適當的回覆。`
      : `使用者訊息：${userMessage}\n請生成適當的回覆。`;
    
    return await this.generateResponse(prompt, systemMessage);
  }
}

export default new OpenAIService();
