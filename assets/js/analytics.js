/**
 * Google Analytics Event Tracking
 * 페낭한인교회 웹사이트 사용자 동작 추적
 */

(function() {
  'use strict';

  // Google Analytics가 로드될 때까지 대기
  if (typeof gtag === 'undefined') {
    console.warn('Google Analytics가 로드되지 않았습니다.');
    return;
  }

  /**
   * 이벤트 전송 헬퍼 함수
   */
  function trackEvent(eventName, eventCategory, eventLabel, eventValue) {
    gtag('event', eventName, {
      'event_category': eventCategory,
      'event_label': eventLabel,
      'value': eventValue || 0
    });
    console.log('📊 GA Event:', eventName, eventCategory, eventLabel);
  }

  /**
   * 1. 전화번호 클릭 추적
   */
  function trackPhoneCalls() {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        const phoneNumber = this.getAttribute('href').replace('tel:', '');
        const phoneType = phoneNumber.includes('17') ? '휴대전화' : '일반전화';
        trackEvent('전화_클릭', '연락처', phoneType + ': ' + phoneNumber);
      });
    });
  }

  /**
   * 2. 이메일 클릭 추적
   */
  function trackEmailClicks() {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        const email = this.getAttribute('href').replace('mailto:', '');
        trackEvent('이메일_클릭', '연락처', email);
      });
    });
  }

  /**
   * 3. 지도/주소 클릭 추적
   */
  function trackMapClicks() {
    const mapLinks = document.querySelectorAll('a[href*="maps.app.goo.gl"], a[href*="google.com/maps"]');
    mapLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        trackEvent('지도_클릭', '길찾기', '구글맵_열기');
      });
    });
  }

  /**
   * 4. 외부 링크 클릭 추적
   */
  function trackExternalLinks() {
    const externalLinks = document.querySelectorAll('a[target="_blank"]:not([href*="maps"])');
    externalLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        const url = this.getAttribute('href');
        const linkText = this.textContent.trim() || url;
        trackEvent('외부_링크_클릭', '아웃바운드', linkText);
      });
    });
  }

  /**
   * 5. 네비게이션 메뉴 클릭 추적
   */
  function trackNavigation() {
    const navLinks = document.querySelectorAll('.site-nav a, .nav-link');
    navLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        const linkText = this.textContent.trim();
        const linkUrl = this.getAttribute('href');
        trackEvent('네비게이션_클릭', '메뉴', linkText);
      });
    });
  }

  /**
   * 6. 스크롤 깊이 추적
   */
  function trackScrollDepth() {
    let scrollMarks = {
      '25%': false,
      '50%': false,
      '75%': false,
      '100%': false
    };

    window.addEventListener('scroll', function() {
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;

      if (scrollPercent >= 25 && !scrollMarks['25%']) {
        scrollMarks['25%'] = true;
        trackEvent('스크롤', '페이지_참여도', '25% 스크롤', 25);
      }
      if (scrollPercent >= 50 && !scrollMarks['50%']) {
        scrollMarks['50%'] = true;
        trackEvent('스크롤', '페이지_참여도', '50% 스크롤', 50);
      }
      if (scrollPercent >= 75 && !scrollMarks['75%']) {
        scrollMarks['75%'] = true;
        trackEvent('스크롤', '페이지_참여도', '75% 스크롤', 75);
      }
      if (scrollPercent >= 99 && !scrollMarks['100%']) {
        scrollMarks['100%'] = true;
        trackEvent('스크롤', '페이지_참여도', '100% 스크롤', 100);
      }
    });
  }

  /**
   * 7. 소식/공지 클릭 추적
   */
  function trackPostClicks() {
    const postLinks = document.querySelectorAll('.post-link, .news-item a');
    postLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        const postTitle = this.textContent.trim();
        trackEvent('게시물_클릭', '소식_공지', postTitle);
      });
    });
  }

  /**
   * 8. CTA(Call-to-Action) 버튼 추적
   */
  function trackCTAButtons() {
    const ctaButtons = document.querySelectorAll('.btn, .button, .cta-button');
    ctaButtons.forEach(function(button) {
      button.addEventListener('click', function(e) {
        const buttonText = this.textContent.trim();
        trackEvent('CTA_클릭', '행동_유도', buttonText);
      });
    });
  }

  /**
   * 9. 파일 다운로드 추적
   */
  function trackFileDownloads() {
    const fileLinks = document.querySelectorAll('a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[href$=".zip"]');
    fileLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        const fileName = this.getAttribute('href').split('/').pop();
        trackEvent('파일_다운로드', '다운로드', fileName);
      });
    });
  }

  /**
   * 10. 페이지 체류 시간 추적
   */
  function trackTimeOnPage() {
    let startTime = Date.now();

    // 5분 체류 시 이벤트
    setTimeout(function() {
      trackEvent('체류_시간', '참여도', '5분_이상_체류', 5);
    }, 5 * 60 * 1000);

    // 페이지를 떠날 때
    window.addEventListener('beforeunload', function() {
      let timeSpent = Math.round((Date.now() - startTime) / 1000); // 초 단위
      if (timeSpent > 10) { // 10초 이상 체류한 경우만
        trackEvent('체류_시간', '참여도', '총_체류_시간', timeSpent);
      }
    });
  }

  /**
   * 11. 모바일에서 카페 링크를 모바일 버전으로 변경
   */
  function updateCafeLinksForMobile() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      const cafeLinks = document.querySelectorAll('a[href="https://cafe.daum.net/PenangChurch"]');
      cafeLinks.forEach(function(link) {
        link.href = 'https://m.cafe.daum.net/PenangChurch/';
      });
      console.log('📱 모바일 카페 링크로 변경됨:', cafeLinks.length + '개');
    }
  }

  /**
   * 모든 추적 초기화
   */
  function initAnalytics() {
    // DOM이 로드된 후 실행
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        updateCafeLinksForMobile();
        trackPhoneCalls();
        trackEmailClicks();
        trackMapClicks();
        trackExternalLinks();
        trackNavigation();
        trackScrollDepth();
        trackPostClicks();
        trackCTAButtons();
        trackFileDownloads();
        trackTimeOnPage();

        console.log('✅ Google Analytics 이벤트 추적 초기화 완료');
      });
    } else {
      updateCafeLinksForMobile();
      trackPhoneCalls();
      trackEmailClicks();
      trackMapClicks();
      trackExternalLinks();
      trackNavigation();
      trackScrollDepth();
      trackPostClicks();
      trackCTAButtons();
      trackFileDownloads();
      trackTimeOnPage();

      console.log('✅ Google Analytics 이벤트 추적 초기화 완료');
    }
  }

  // 초기화 실행
  initAnalytics();

})();
