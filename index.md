---
layout: default
title: "은혜한인교회"
seo_title: "은혜한인교회 | 몰린·Quad Cities 한인교회 (Grace Korean Church, Moline IL)"
description: "미국 일리노이주 몰린(Quad Cities)에서 함께 예배하는 한인 교회. 은혜한인교회 예배 안내와 오시는 길"
keywords: "은혜한인교회, Grace Korean Church, 몰린 한인교회, Quad Cities 한인교회, 일리노이 한인교회"
permalink: /
alt_lang: en
alt_url: /en/
---

<!-- Hero Section -->
<section class="hero-fullscreen">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <h1 class="hero-title">은혜한인교회</h1>
    <p class="hero-tagline">사랑하며 섬기며 복음을 전하는 교회</p>
    <p class="hero-text">몰린과 Quad Cities에서 함께 예배하는 한인 교회입니다</p>
    <p class="hero-time">주일예배 오전 10시 30분</p>
    <div class="hero-actions">
      <a href="{{ '/services/' | relative_url }}" class="btn btn-hero-primary">예배 안내</a>
      <a href="{{ '/visit/' | relative_url }}" class="btn btn-hero-outline" style="border: 2px solid #fff; color: #fff;">오시는 길</a>
    </div>
  </div>
</section>

<!-- Location Section -->
<section class="section-fullwidth section-white">
  <div class="container">
    <div class="two-column location-grid">
      <div class="column-info-lifehouse">
        <h2 class="location-time">주일 오전 10시 30분</h2>
        <p class="location-address">
          <span class="address-text">{{ site.church.address }}</span>
        </p>
        <div class="location-buttons">
          <a href="{{ site.church.map_url }}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">📍 구글맵</a>
        </div>
      </div>
      <div class="column-map">
        <iframe
          title="은혜한인교회 위치 - Google Maps"
          src="https://www.google.com/maps?q=Grace+Korean+Church,+21st+Ave+A,+Moline,+IL+61265&output=embed"
          width="100%"
          height="350"
          style="border:0; border-radius: 12px;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    </div>
  </div>
</section>

<!-- Intro Section -->
<section class="section-fullwidth section-photo section-photo-congregation">
  <div class="container">
    <div class="text-center">
      <h2>처음 오시는 분께</h2>
      <p class="lead-text">
        은혜한인교회는 처음 오시는 모든 분을 환영합니다.
        예약이나 사전 연락 없이 편하게 오셔서 함께 예배드리시면 됩니다.
      </p>
      <p class="lead-text">
        궁금한 점은 교회 <a href="{{ site.social.facebook }}" target="_blank" rel="noopener noreferrer">페이스북</a>으로 문의해 주세요.
      </p>
      <p>
        <a href="{{ '/about/' | relative_url }}" class="btn btn-outline">교회 소개 보기</a>
      </p>
    </div>
  </div>
</section>

<!-- FAQ: 사람과 AI 답변 엔진이 그대로 가져다 쓸 문장. 내용은 _data/faq.yml -->
{% include faq-section.html lang="ko" %}

<!-- Recent News -->
{% if site.posts.size > 0 %}
<section class="section-fullwidth section-white">
  <div class="container">
    <h2 class="text-center">최근 소식</h2>
    <div class="card-grid">
      {% for post in site.posts limit: 3 %}
      <article class="card">
        <div class="card-meta">
          <span>{{ post.date | date: "%Y년 %m월 %d일" }}</span>
          {% if post.category %}<span class="card-category">{{ post.category }}</span>{% endif %}
        </div>
        <h3 class="card-title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        {% if post.summary %}<p class="card-summary">{{ post.summary }}</p>{% endif %}
        <a href="{{ post.url | relative_url }}" class="card-link">자세히 보기 →</a>
      </article>
      {% endfor %}
    </div>
    <p class="text-center"><a href="{{ '/news/' | relative_url }}" class="btn btn-outline">소식 전체 보기</a></p>
  </div>
</section>
{% endif %}
