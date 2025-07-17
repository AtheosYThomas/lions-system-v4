
import { WebhookEvent, MessageEvent, TextMessage } from '@line/bot-sdk';

export interface LineTextMessageEvent extends MessageEvent {
  message: TextMessage;
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
