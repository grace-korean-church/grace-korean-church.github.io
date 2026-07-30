---
layout: default
title: "Welcome"
description: "Grace Korean Church — a Korean-speaking congregation in Moline, Illinois, serving the Quad Cities area."
keywords: "Grace Korean Church, Korean church Moline, Korean church Quad Cities, Korean church Illinois"
permalink: /en/
alt_lang: ko
alt_url: /
---

<section class="hero-fullscreen">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <h1 class="hero-title">Grace Korean Church</h1>
    <p class="hero-tagline">은혜한인교회</p>
    <p class="hero-text">A Korean-speaking congregation in Moline, Illinois</p>
    <div class="hero-actions">
      <a href="{{ site.church.map_url }}" target="_blank" rel="noopener noreferrer" class="btn btn-hero-primary">Get Directions</a>
    </div>
  </div>
</section>

<div class="container page-container">
  <div class="page-content">

    <h2>Welcome</h2>

    <p>
      Grace Korean Church is a Korean-speaking congregation serving the Quad Cities
      area from Moline, Illinois. Whether you have lived here for years or have just
      arrived, you are welcome to join us.
    </p>

    <p><strong>Please note:</strong> our services are held in Korean.</p>

    <h2>Service Times</h2>

    <!-- TODO: Replace with confirmed service times once the church provides them. -->
    <p>
      Current service times are announced on our
      <a href="{{ site.social.facebook }}" target="_blank" rel="noopener noreferrer">Facebook page</a>.
      Please check there before visiting. Past services are available on our
      <a href="{{ site.social.youtube }}" target="_blank" rel="noopener noreferrer">YouTube channel</a>.
    </p>

    <h2>Location</h2>

    <p>
      <strong>{{ site.church.address }}</strong><br>
      <a href="{{ site.church.map_url }}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
    </p>

    <div class="map-container">
      <iframe
        title="Grace Korean Church location - Google Maps"
        src="https://www.google.com/maps?q=4915%2021st%20Ave%20A,%20Moline,%20IL%2061265&output=embed"
        width="100%"
        height="420"
        style="border:0; border-radius: 12px;"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>
    </div>

    <h2>Contact</h2>

    <p>
      The quickest way to reach us is through our
      <a href="{{ site.social.facebook }}" target="_blank" rel="noopener noreferrer">Facebook page</a>.
      {% if site.church.phone != "" %}
      You can also call us at <a href="tel:{{ site.church.phone }}">{{ site.church.phone }}</a>.
      {% endif %}
    </p>

    <p>
      <a href="{{ '/en/about/' | relative_url }}" class="btn btn-outline">More about us</a>
    </p>

  </div>
</div>
