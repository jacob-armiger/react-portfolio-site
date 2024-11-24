---
title: "rendering-engine"
description: "An interactive 3D environment that works right in your browser."
tags:
- WebGL 2.0
- GLSL
- JavScript
---

# rendering-engine
[Github Repo](https://github.com/jacob-armiger/rendering-engine)  
  
This is a project I did for school, but I went above and beyond the requirements. We were required to implement a certain number objects and shaders, but I architected my program so that I could render as many objects with as many shaders as I want. Hence, why I call this an "engine". I could give this program any list of objects that follows the convention I've created and it would work. I had a lot of fun doing this and, in the future, it would be cool to implement object shadows.

Getting my WebGL script running in this project was a separate problem to solve. I used Webpack to bundle 
my engine scripts and simply give a script tag the bundled source file. My HTML elements have to have the
same classes and ids as they did in the original rendering project so that the canvas and sliders are hooked
up properly.

## Further Reading
[WebPack Docs](https://webpack.js.org/guides/getting-started/)  
[Article on Webpack](https://dev.to/antonmelnyk/how-to-configure-webpack-from-scratch-for-a-basic-website-46a5#:~:text=As%20you%20may%20know%2C%20configuring,which%20is%20a%20good%20thing.)  
[History of JavaScript Modules](https://medium.com/the-node-js-collection/modern-javascript-explained-for-dinosaurs-f695e9747b70)  