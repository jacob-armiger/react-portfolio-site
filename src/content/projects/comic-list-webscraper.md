---
title: "comic-list-webscraper"
image: "./comic_list.png"
description: "A web application that dynamically wrangles data from comicbookreadingorders.com to provide users a method to track reading progress."
tags:
- python
- Flask
- Web Scraping
---

# comic-list-webscraper
### [Github Repo](https://github.com/jacob-armiger/comic-list-web-scraper)
This web app allows readers to keep track of things they’ve read from comicbookreadingorders.com. Each reading order is on its own page, so readers just need to copy the URL and paste it into the prompt in the [web app](https://www.comicbookreadingordersdownload.com).

Originally this project started as a Python script I made for myself. I didn’t think I would be creating a tool that other people would use. Then I had the idea to contact the owner of the website mention above and ask if he was interested in a tool like this, and he said he’s had users request similar features. My first idea was to create a distributable executable, but after multi-platform and EV certificate issues I pivoted to a web app.

My web app has emulated the style of comicbookreadingorders.com, but it’s hosted separately and on a different domain name. In the future I'd like to rewrite the script from Python to JavaScipt so I can host the site for free on Vercel!

