/**
 * Theme Toggle
 * Dark/Light mode switcher with system preference support
 */

(function() {
  'use strict';

  // 시스템 테마 가져오기
  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // 초기 테마 설정
  function initTheme() {
    // localStorage에서 저장된 테마 가져오기
    const savedTheme = localStorage.getItem('theme');

    // 저장된 테마가 있으면 사용, 없으면 시스템 설정 따라가기
    const theme = savedTheme || getSystemTheme();

    // 테마 적용
    document.documentElement.setAttribute('data-theme', theme);

    return theme;
  }

  // 테마 전환 (라이트 ↔ 다크)
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // 테마 변경
    document.documentElement.setAttribute('data-theme', newTheme);

    // localStorage에 저장 (이제부터 시스템 설정 무시)
    localStorage.setItem('theme', newTheme);

    // 아이콘 업데이트
    updateThemeIcon(newTheme);

    return newTheme;
  }

  // 테마 아이콘 업데이트
  function updateThemeIcon(theme) {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;

    const english = document.documentElement.lang === 'en';
    if (theme === 'dark') {
      button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>';
      button.setAttribute('aria-label', english ? 'Switch to light mode' : '라이트 모드로 전환');
      button.setAttribute('title', english ? 'Switch to light mode' : '라이트 모드로 전환');
    } else {
      button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/></svg>';
      button.setAttribute('aria-label', english ? 'Switch to dark mode' : '다크 모드로 전환');
      button.setAttribute('title', english ? 'Switch to dark mode' : '다크 모드로 전환');
    }
  }

  // DOM 로드 후 실행
  function init() {
    // 초기 테마 설정
    const currentTheme = initTheme();

    // 버튼이 있으면 아이콘 업데이트
    updateThemeIcon(currentTheme);

    // 버튼 클릭 이벤트
    const button = document.querySelector('.theme-toggle');
    if (button) {
      button.addEventListener('click', toggleTheme);
    }

    // 시스템 테마 변경 감지 (사용자가 수동으로 설정 안 한 경우만)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // localStorage에 저장된 값이 없을 때만 시스템 설정 따라가기
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
      }
    });
  }

  // DOM 완전 로드 후 이벤트 리스너 등록 (initTheme은 인라인 스크립트에서 이미 실행됨)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
