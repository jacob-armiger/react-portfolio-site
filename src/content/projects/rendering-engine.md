---
title: "rendering-engine"
image: "./comic_list.png"
description: "A rendering engine I built with WebGL 2.0"
tags:
- WebGL 2.0
- GLSL
- JavScript
---

# rendering-engine
### [Github Repo](https://github.com/jacob-armiger/rendering-engine)
This is a project I did for school, but I went above and beyond the requirements. We were required to implement a certain number objects and shaders, but I architected my program so that I could render as many objects with as many shaders as I want. I do this via data-driven programming (I give my program a list of objects). I had a lot of fun doing this and, in the future, it would be cool to implement object shadows!

Getting my WebGL script running in this react project was a whole other problem to solve. I ended up bundling the whole script with webpack and then using raw JavaScript to create a script element.

### Further Reading
[WebPack Docs](https://webpack.js.org/guides/getting-started/)
[Article on Webpack](https://dev.to/antonmelnyk/how-to-configure-webpack-from-scratch-for-a-basic-website-46a5#:~:text=As%20you%20may%20know%2C%20configuring,which%20is%20a%20good%20thing.)
[History of JavaScript Modules](https://medium.com/the-node-js-collection/modern-javascript-explained-for-dinosaurs-f695e9747b70)