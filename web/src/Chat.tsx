import { useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError, sendMessage, type Conversation } from './api.ts';
import { chatReducer, createInitialChatState } from './chat-state.ts';
import { CorrectionCard } from './CorrectionCard.tsx';

export const Chat = ({
  conversation,
  onEnd,
}: {
  conversation: Conversation;
  onEnd: () => void;
}) => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(chatReducer, conversation.opening, createInitialChatState);
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLOListElement>(null);

  const error = typeof state.status === 'object' ? state.status.error : undefined;
  const canSend = state.status === 'idle' && draft.trim() !== '';

  // Keep the newest Message in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [state]);

  const deliver = async (content: string) => {
    try {
      dispatch({ type: 'replied', tutorReply: await sendMessage(conversation.id, content) });
    } catch (caught) {
      console.error(caught);
      dispatch({ type: 'failed', error: caught instanceof ApiError ? caught.code : 'unexpected' });
    }
  };

  const send = () => {
    if (!canSend) return;
    const content = draft.trim();
    setDraft('');
    dispatch({ type: 'sent', content });
    void deliver(content);
  };

  const resend = () => {
    // After a failure the last Message is always the Learner's unanswered one.
    const last = state.messages.at(-1);
    if (last?.role !== 'learner') return;
    dispatch({ type: 'resent' });
    void deliver(last.content);
  };

  return (
    <div className="mx-auto flex h-dvh max-w-2xl flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-highlight-med px-4 py-3">
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate font-medium" title={conversation.topic}>
            {conversation.topic}
          </h1>
          <span className="text-sm text-subtle">
            {t(`targetLanguage.${conversation.targetLanguage}`)} · {conversation.level}
          </span>
        </div>
        <button type="button" onClick={onEnd} className="shrink-0 text-pine hover:underline">
          {t('chat.newConversation')}
        </button>
      </header>

      <ol ref={listRef} className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        {state.messages.map((message, i) =>
          message.role === 'learner' ? (
            <li key={i} className="flex flex-col items-end gap-2">
              <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-overlay px-4 py-2 whitespace-pre-wrap">
                {message.content}
              </p>
              {message.corrections?.length === 0 && (
                <span className="text-sm text-foam">✓ {t('chat.noMistakes')}</span>
              )}
              {message.corrections?.map((correction, j) => (
                <div key={j} className="w-full max-w-[80%]">
                  <CorrectionCard correction={correction} />
                </div>
              ))}
            </li>
          ) : (
            <li key={i} className="flex">
              <p className="max-w-[80%] rounded-2xl rounded-bl-sm border border-highlight-med bg-surface px-4 py-2 whitespace-pre-wrap">
                {message.reply}
              </p>
            </li>
          ),
        )}

        {state.status === 'sending' && <li className="text-muted">{t('chat.typing')}</li>}
        {error && (
          <li className="flex flex-col items-end gap-2 text-sm">
            <p className="text-love">{t(`error.${error}`)}</p>
            {error === 'conversation-not-found' ? (
              <button type="button" onClick={onEnd} className="text-pine hover:underline">
                {t('chat.newConversation')}
              </button>
            ) : (
              <button type="button" onClick={resend} className="text-pine hover:underline">
                {t('chat.resend')}
              </button>
            )}
          </li>
        )}
      </ol>

      <form
        className="flex gap-2 border-t border-highlight-med p-4"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <textarea
          autoFocus
          rows={2}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              send();
            }
          }}
          placeholder={t('chat.placeholder')}
          className="flex-1 resize-none rounded-lg border border-highlight-med bg-surface px-3 py-2 placeholder:text-muted focus-visible:outline-2 focus-visible:outline-iris"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-lg bg-pine px-4 font-medium text-surface hover:bg-foam focus-visible:outline-2 focus-visible:outline-iris disabled:bg-highlight-high disabled:text-muted"
        >
          {t('chat.send')}
        </button>
      </form>
    </div>
  );
};
