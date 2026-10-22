import { act, renderHook } from '@/test-utils/rtl';

import useUrlDraft from '../use-url-draft';
import { type UseUrlDraftWriteMode } from '../use-url-draft.types';

describe(useUrlDraft.name, () => {
  it('seeds the draft from the committed value on mount', () => {
    const { result } = setup({ committedValue: 'initial' });
    expect(result.current.draft).toBe('initial');
  });

  it('commits every edit in immediate mode', () => {
    const { result, onCommit } = setup({});
    act(() => result.current.setDraft('abc'));
    expect(result.current.draft).toBe('abc');
    expect(onCommit).toHaveBeenCalledWith('abc');
  });

  it('never commits on edit in manual mode', () => {
    const { result, onCommit } = setup({ writeMode: 'manual' });
    act(() => result.current.setDraft('abc'));
    expect(result.current.draft).toBe('abc');
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('keeps the draft and re-asserts the last committed value when the URL reverts while editing', () => {
    // The F5 case: the URL-owned value changes without a popstate mid-edit.
    const { result, onCommit, rerender } = setup({
      committedValue: 'committed',
      writeMode: 'manual',
    });
    act(() => result.current.focusProps.onFocus());
    act(() => result.current.setDraft('typed text'));

    rerender({ committedValue: 'reverted' });

    expect(result.current.draft).toBe('typed text');
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith('committed');
  });

  it('stops re-asserting once the URL is repaired (no loop)', () => {
    const { result, onCommit, rerender } = setup({
      committedValue: 'committed',
      writeMode: 'manual',
    });
    act(() => result.current.focusProps.onFocus());
    act(() => result.current.setDraft('typed text'));
    rerender({ committedValue: 'reverted' });
    onCommit.mockClear();

    rerender({ committedValue: 'committed' });
    expect(onCommit).not.toHaveBeenCalled();
    expect(result.current.draft).toBe('typed text');
  });

  it('follows the committed value when not editing', () => {
    const { result, rerender } = setup({ committedValue: 'a' });
    rerender({ committedValue: 'b' });
    expect(result.current.draft).toBe('b');
  });

  it('yields to popstate: re-syncs the draft and cancels a pending debounced commit', () => {
    jest.useFakeTimers();
    const { result, onCommit, rerender } = setup({
      committedValue: '',
      writeMode: { debounceMs: 250 },
    });
    act(() => result.current.focusProps.onFocus());
    act(() => result.current.setDraft('abc'));
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    rerender({ committedValue: 'back-value' });
    jest.advanceTimersByTime(1000);

    expect(result.current.draft).toBe('back-value');
    expect(onCommit).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('lets a pending commit proceed when popstate leaves the value unchanged and the user keeps typing', () => {
    jest.useFakeTimers();
    const { result, onCommit } = setup({
      committedValue: '',
      writeMode: { debounceMs: 250 },
    });
    act(() => result.current.focusProps.onFocus());
    act(() => result.current.setDraft('abc'));
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    act(() => result.current.setDraft('abcd'));
    jest.advanceTimersByTime(1000);

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith('abcd');
    jest.useRealTimers();
  });

  it('flushes a pending debounced commit on blur', () => {
    jest.useFakeTimers();
    const { result, onCommit } = setup({
      committedValue: '',
      writeMode: { debounceMs: 250 },
    });
    act(() => result.current.focusProps.onFocus());
    act(() => result.current.setDraft('abc'));
    act(() => result.current.focusProps.onBlur());

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith('abc');
    jest.useRealTimers();
  });

  it('cancels a pending debounced commit on unmount', () => {
    jest.useFakeTimers();
    const { result, onCommit, unmount } = setup({
      committedValue: '',
      writeMode: { debounceMs: 250 },
    });
    act(() => result.current.setDraft('abc'));
    unmount();
    jest.advanceTimersByTime(1000);

    expect(onCommit).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('does not copy the committed value on blur (Run-click scenario)', () => {
    const { result } = setup({ committedValue: 'committed' });
    act(() => result.current.focusProps.onFocus());
    act(() => result.current.setDraft('typed text'));
    act(() => result.current.focusProps.onBlur());

    expect(result.current.draft).toBe('typed text');
  });
});

function setup({
  committedValue = '',
  writeMode = 'immediate',
}: {
  committedValue?: string;
  writeMode?: UseUrlDraftWriteMode;
}) {
  const onCommit = jest.fn();
  const renderResult = renderHook(
    (props?: { committedValue: string }) =>
      useUrlDraft({
        committedValue: props?.committedValue ?? '',
        onCommit,
        writeMode,
      }),
    undefined,
    { initialProps: { committedValue } }
  );
  return {
    onCommit,
    ...renderResult,
    rerender: (props: { committedValue: string }) =>
      renderResult.rerender(props),
  };
}
