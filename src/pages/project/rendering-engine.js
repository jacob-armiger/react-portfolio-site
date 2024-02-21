import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Button from "@/components/Button";

export default function Project() {
    let router = useRouter();

    let project = null;
    if (router.query.object) {
        // Conditional is needed for build error
        project = JSON.parse(router.query.object);
    }

    // let markdown = `# *This is markdown*`;

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const scriptMain = document.createElement("script");
        scriptMain.src = "/rendering-engine/bundle.js";
        scriptMain.async = true;
        scriptMain.type = "module";
        document.body.appendChild(scriptMain);

        scriptMain.addEventListener("load", () => setLoaded(true));
    }, []);

    useEffect(() => {
        if (!loaded) return;
    }, [loaded]);

    return (
        <div>
            <h1 className="my-4 text-center font-bold">{project?.name}</h1>
            <p className="text-center font-bold">
                *Warning*: this page may not work on your mobile device
                {/* {loaded ? "Script loaded" : "script not loaded"} */}
            </p>

            {/* CANVAS AND SLIDERS */}
            <div className="m-auto flex flex-col lg:w-9/12 2xl:w-1/2">
                <canvas id="glCanvas" width="640" height="480"></canvas>
                <br />
                <div className="mb-8 sm:flex sm:flex-row">
                    <div className="float-left w-1/2 ">
                        <p>Camera Position:</p>
                        <div>
                            <label htmlFor="camX">X:</label>
                            <input
                                type="range"
                                min="-30"
                                max="30"
                                value="0"
                                step="0.1"
                                id="camX"
                            />
                            <input
                                id="camXVal"
                                name="camXVal"
                                value="0"
                                className="w-5"
                            />
                        </div>
                        <div>
                            <label htmlFor="camY">Y:</label>
                            <input
                                type="range"
                                min="-30"
                                max="30"
                                value="3"
                                step="0.1"
                                id="camY"
                            />
                            <input
                                id="camYVal"
                                name="camYVal"
                                value="3"
                                className="w-5"
                            />
                        </div>
                        <div>
                            <label htmlFor="camZ">Z:</label>
                            <input
                                type="range"
                                min="-30"
                                max="30"
                                value="-10"
                                step="0.1"
                                id="camZ"
                            />
                            <input
                                id="camZVal"
                                name="camZVal"
                                value="-10"
                                className="w-5"
                            />
                        </div>
                    </div>
                    <div className="float-left w-1/2">
                        <p>Look Angle:</p>
                        <div>
                            <label htmlFor="lookX">X:</label>
                            <input
                                type="range"
                                min="-30"
                                max="30"
                                value="0"
                                step="0.1"
                                id="lookX"
                            />
                            <input
                                id="lookXVal"
                                name="lookXVal"
                                value="0"
                                className="w-5"
                            />
                        </div>
                        <div>
                            <label htmlFor="lookY">Y:</label>
                            <input
                                type="range"
                                min="-30"
                                max="30"
                                value="-1"
                                step="0.1"
                                id="lookY"
                            />
                            <input
                                id="lookYVal"
                                name="lookYVal"
                                value="-1"
                                className="w-5"
                            />
                        </div>
                        <div>
                            <label htmlFor="lookZs">Z:</label>
                            <input
                                type="range"
                                min="-30"
                                max="30"
                                value="0"
                                step="0.1"
                                id="lookZ"
                            />
                            <input
                                id="lookZVal"
                                name="lookZVal"
                                value="0"
                                className="w-5"
                            />
                        </div>
                    </div>
                    <div className="float-left w-1/2">
                        <p>Lighting Position:</p>
                        <div>
                            <label htmlFor="lightX">X:</label>
                            <input
                                type="range"
                                min="-30"
                                max="30"
                                value="1"
                                step="0.1"
                                id="lightX"
                            />
                            <input
                                id="lightXVal"
                                name="lightXVal"
                                value="1"
                                className="w-5"
                            />
                        </div>
                        <div>
                            <label htmlFor="lightY">Y:</label>
                            <input
                                type="range"
                                min="-30"
                                max="30"
                                value="4"
                                step="0.1"
                                id="lightY"
                            />
                            <input
                                id="lightYVal"
                                name="lightYVal"
                                value="4"
                                className="w-5"
                            />
                        </div>
                        <div>
                            <label htmlFor="lightZ">Z:</label>
                            <input
                                type="range"
                                min="-30"
                                max="30"
                                value="-4"
                                step="0.1"
                                id="lightZ"
                            />
                            <input
                                id="lightZVal"
                                name="lightZVal"
                                value="-4"
                                className="w-5"
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Content */}
            <div className="mx-1 my-4 flex max-w-prose flex-col items-center sm:mx-auto sm:items-start">
                <div className="flex w-min flex-row space-x-4">
                    <Button
                        url="https://github.com/jacob-armiger/rendering-engine"
                        title="Project Github"
                    />
                </div>
                <p>
                    This is a project I did for school, but I went above and
                    beyond the requirements. We were required to implement a
                    certain number objects and shaders, but I architected my
                    program so that I could render as many objects with as many
                    shaders as I want. I do this via data-driven programming (I
                    give my program a list of objects). I had a lot of fun doing
                    this and, in the future, it would be cool to implement
                    object shadows!
                    <br />
                    <br />
                    Getting my WebGL script running in this react project was a
                    whole other problem to solve. I ended up bundling the whole
                    script with webpack and then using raw JavaScript to create
                    a script element.
                </p>
            </div>

            {/* FURTHER READING */}
            <h1>Further Reading</h1>
            <div className="justify-left mt-4 flex flex-row">
                <Button
                    url="https://webpack.js.org/guides/getting-started/"
                    title="Webpack Docs"
                />
                <Button
                    url="https://dev.to/antonmelnyk/how-to-configure-webpack-from-scratch-for-a-basic-website-46a5#:~:text=As%20you%20may%20know%2C%20configuring,which%20is%20a%20good%20thing."
                    title="Article on Webpack"
                />
                <Button
                    url="https://medium.com/the-node-js-collection/modern-javascript-explained-for-dinosaurs-f695e9747b70"
                    title="History of Javascript Modules"
                />
            </div>
        </div>
    );
}
