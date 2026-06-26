import type { Message, MsgType } from './types';

/** Send a message to the background service worker */
export async function sendToBackground<TPayload, TResponse = void>(
  type: MsgType,
  payload?: TPayload,
): Promise<TResponse> {
  return chrome.runtime.sendMessage<Message<TPayload>, TResponse>({
    type,
    payload,
    timestamp: Date.now(),
  });
}

/** Send a message to a specific tab's content script */
export async function sendToTab<TPayload, TResponse = void>(
  tabId: number,
  type: MsgType,
  payload?: TPayload,
): Promise<TResponse> {
  return chrome.tabs.sendMessage<Message<TPayload>, TResponse>(tabId, {
    type,
    payload,
    tabId,
    timestamp: Date.now(),
  });
}

/** Register a message listener (background or content) */
export function onMessage<TPayload = unknown, TResponse = void>(
  handler: (
    msg: Message<TPayload>,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: TResponse) => void,
  ) => boolean | void,
): () => void {
  chrome.runtime.onMessage.addListener(handler);
  return () => chrome.runtime.onMessage.removeListener(handler);
}

/** Register a typed message handler — returns cleanup fn */
export function onMessageType<TPayload = unknown>(
  type: MsgType,
  handler: (payload: TPayload, sender: chrome.runtime.MessageSender) => void | Promise<unknown>,
): () => void {
  return onMessage((msg, sender, sendResponse) => {
    if (msg.type !== type) return;
    const result = handler(msg.payload as TPayload, sender);
    if (result instanceof Promise) {
      result.then(sendResponse).catch(console.error);
      return true; // keep channel open
    }
  });
}

/** Ping background to keep service worker alive */
export async function pingBackground(): Promise<boolean> {
  try {
    const response = await sendToBackground(MsgType.PING as MsgType);
    return response !== undefined;
  } catch {
    return false;
  }
}
