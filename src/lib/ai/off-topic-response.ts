import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  type UIMessage,
} from "ai";

export function createOffTopicDeclineResponse(
  message: string,
  originalMessages: unknown[]
): Response {
  const textPartId = generateId();
  const messageId = generateId();

  const stream = createUIMessageStream<UIMessage>({
    originalMessages: originalMessages as UIMessage[],
    generateId,
    execute: ({ writer }) => {
      writer.write({ type: "start", messageId });
      writer.write({ type: "start-step" });
      writer.write({ type: "text-start", id: textPartId });
      writer.write({ type: "text-delta", id: textPartId, delta: message });
      writer.write({ type: "text-end", id: textPartId });
      writer.write({ type: "finish-step" });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
}
