---
layout: default
title: "Welcome"
seo_title: "Grace Korean Church | Korean Church in Moline, IL (Quad Cities)"
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
    <p class="hero-tagline">A church that loves, serves, and proclaims the gospel</p>
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

    <p>
      <strong>Please note:</strong> our services are held in Korean,
      <strong>with English interpretation provided</strong>. We also hold an
      English Bible study on Wednesday mornings. If you do not speak Korean,
      you are still very welcome to join us.
    </p>

    <h2>Service Times</h2>

    <table>
      <tr><th>The Lord's Day</th><th></th></tr>
      <tr><td>Worship Service</td><td>10:30 AM</td></tr>
      <tr><td>Sunday School</td><td>10:30 AM</td></tr>
      <tr><th>Weekday</th><th></th></tr>
      <tr><td>Wed. Bible Study</td><td>10:00 AM &middot; 7:00 PM</td></tr>
      <tr><td>Wed. English Bible Study</td><td>10:00 AM</td></tr>
      <tr><td>Fri. Prayer Meeting</td><td>7:00 PM</td></tr>
    </table>

    <p>
      Sunday worship is held in Korean with English interpretation. There is also a
      separate English Bible study on Wednesday mornings. Past services are available on our
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
        src="https://www.google.com/maps?q=Grace+Korean+Church,+21st+Ave+A,+Moline,+IL+61265&output=embed"
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
      Phone: <a href="tel:+1{{ site.church.phone | remove: "-" }}">{{ site.church.phone }}</a><br>
      Email: <a href="mailto:{{ site.church.email }}">{{ site.church.email }}</a><br>
      You can also reach us through our
      <a href="{{ site.social.facebook }}" target="_blank" rel="noopener noreferrer">Facebook page</a>.
    </p>

    <p>
      <a href="{{ '/en/about/' | relative_url }}" class="btn btn-outline">More about us</a>
    </p>

  </div>
</div>
