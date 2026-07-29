source "https://rubygems.org"

# Jekyll version compatible with GitHub Pages
gem "jekyll", "~> 4.3"

# Required for Jekyll 3.0+
gem "webrick", "~> 1.8"

# Jekyll plugins
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17"
end

# Windows and JRuby does not include zoneinfo files
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1", :platforms => [:mingw, :x64_mingw, :mswin]

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]
