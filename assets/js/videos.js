// 예배 영상 페이지: 썸네일을 누르면 그 자리에 유튜브 플레이어를 넣는다.
// 재생 전에는 유튜브 스크립트를 전혀 불러오지 않는다.
// JS가 꺼져 있으면 링크가 유튜브로 이동하므로 그대로 동작한다.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.video-thumb[data-video-id]').forEach(function (thumb) {
    thumb.addEventListener('click', function (event) {
      // 새 탭·창으로 열려는 클릭(⌘/Ctrl/가운데 버튼)은 링크에 맡긴다.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();

      var id = thumb.getAttribute('data-video-id');
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      iframe.title = thumb.getAttribute('aria-label') || '';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.setAttribute('loading', 'lazy');

      var player = document.createElement('div');
      player.className = 'video-thumb video-playing';
      player.appendChild(iframe);
      thumb.replaceWith(player);
    });
  });
});
