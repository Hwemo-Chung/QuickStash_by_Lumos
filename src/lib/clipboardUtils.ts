/**
 * 안전한 클립보드 관리
 */

/**
 * 클립보드 쓰기 권한 확인
 */
export async function checkClipboardPermission(): Promise<
  'granted' | 'denied' | 'prompt' | 'unknown'
> {
  if (!navigator.permissions) {
    return 'unknown';
  }

  try {
    const result = await navigator.permissions.query({
      name: 'clipboard-write' as PermissionName,
    });
    return result.state;
  } catch {
    return 'unknown';
  }
}

/**
 * 클립보드에 안전하게 복사
 * @param content 복사할 내용
 * @param isSensitive 민감한 정보 여부 (true면 자동 초기화)
 * @param onSuccess 성공 콜백
 * @param onError 실패 콜백
 */
export async function copyToClipboardSecurely(
  content: string,
  isSensitive: boolean = false,
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<boolean> {
  try {
    // 권한 확인 (민감한 정보인 경우)
    if (isSensitive) {
      const permission = await checkClipboardPermission();
      if (permission === 'denied') {
        const error = '클립보드 접근 권한이 필요합니다';
        onError?.(error);
        return false;
      }
    }

    // 클립보드에 복사
    await navigator.clipboard.writeText(content);
    onSuccess?.();

    // 민감한 정보는 일정 시간 후 자동 초기화
    if (isSensitive) {
      setTimeout(async () => {
        try {
          await navigator.clipboard.writeText('');
        } catch {
          // 이미 초기화되었거나 권한이 변경된 경우
        }
      }, 60000); // 1분 후
    }

    return true;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : '클립보드 복사 실패';
    onError?.(errorMsg);
    return false;
  }
}

/**
 * 클립보드에서 읽기 (권한 필요)
 */
export async function readFromClipboard(): Promise<string | null> {
  try {
    if (!navigator.clipboard) {
      return null;
    }

    const text = await navigator.clipboard.readText();
    return text;
  } catch {
    // 권한 없음 또는 클립보드 접근 불가
    return null;
  }
}

/**
 * 클립보드 초기화 (민감한 정보 제거)
 */
export async function clearClipboard(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText('');
    return true;
  } catch {
    return false;
  }
}

/**
 * 텍스트를 클립보드에 복사 (높은 접근성)
 * fallback: 복사 불가 시 input 요소 사용
 */
export async function copyToClipboardWithFallback(
  text: string,
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<boolean> {
  // Clipboard API 먼저 시도
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      onSuccess?.();
      return true;
    } catch (error) {
      console.warn('Clipboard API failed, trying fallback');
    }
  }

  // Fallback: textarea 사용
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);

    textarea.select();
    const success = document.execCommand('copy');

    document.body.removeChild(textarea);

    if (success) {
      onSuccess?.();
      return true;
    } else {
      throw new Error('execCommand failed');
    }
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : '클립보드에 복사할 수 없습니다';
    onError?.(errorMsg);
    return false;
  }
}
