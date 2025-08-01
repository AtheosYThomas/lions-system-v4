import { WebhookEvent, MessageEvent, TextMessage } from '@line/bot-sdk';

export interface LineTextMessageEvent extends MessageEvent {
  message: {
    id: string;
    type: 'text';
    text: string;
    quoteToken: string;
    emojis?: {
      index: number;
      length: number;
      productId: string;
      emojiId: string;
    }[];
  };
}

export interface LineWebhookRequestBody {
  events: WebhookEvent[];
}

export interface LineReplyMessage {
  type: 'text';
  text: string;
}

export interface LinePushMessage {
  type: 'text';
  text: string;
}

export interface LineServiceResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface LineEventProcessResult {
  success: boolean;
  processedEvents: number;
  errors: string[];
}
