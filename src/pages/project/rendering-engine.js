import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Button from "@/components/Button";

export default function Project() {
    const [camX, setCamX] = useState(0)
    const [camY, setCamY] = useState(3)
    const [camZ, setCamZ] = useState(-10)

    const [lookX, setLookX] = useState(0)
    const [lookY, setLookY] = useState(-1)
    const [lookZ, setLookZ] = useState(0)

    const [lightX, setLightX] = useState(1)
    const [lightY, setLightY] = useState(4)
    const [lightZ, setLightZ] = useState(-4)

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
                <canvas
                    className="rounded-md"
                    id="glCanvas"
                    width="640"
                    height="480"
                />
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
                                defaultValue={camX}
                                step="0.1"
                                id="camX"
                                onChange={(e) => setCamX(e.target.value)}
                            />
                            <input
                                id="camXVal"
                                name="camXVal"
                                value={camX}
                                className="w-5"
                            />
                        </div>
                        <div>
                            <label htmlFor="camY">Y:</label>
                            <input
                                type="range"
                                min="-30"
                                max="30"
                                defaultValue={camY}
                                step="0.1"
                                id="camY"
                                onChange={(e) => setCamY(e.target.value)}
                            />
                            <input
                                id="camYVal"
                                name="camYVal"
                                value={camY}
                                className="w-5"
                            />
                        </div>
                        <div>
                            <label htmlFor="camZ">Z:</label>
                            <input
                                type="range"
                                min="-30"
                                max="30"
                                defaultValue={camZ}
                                step="0.1"
                                id="camZ"
                                onChange={(e) => setCamZ(e.target.value)}
                            />
                            <input
                                id="camZVal"
                                name="camZVal"
                                value={camZ}
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
                                defaultValue={lookX}
                                step="0.1"
                                id="lookX"
                                onChange={(e) => setLookX(e.target.value)}
                            />
                            <input
                                id="lookXVal"
                                name="lookXVal"
                                value={lookX}
                                className="w-5"
                            />
                        </div>
                        <div>
                            <label htmlFor="lookY">Y:</label>
                            <input
                                type="range"
                                min="-30"
                                max="30"
                                defaultValue={lookY}
                                step="0.1"
                                id="lookY"
                                onChange={(e) => setLookY(e.target.value)}
                            />
                            <input
                                id="lookYVal"
                                name="lookYVal"
                                value={lookY}
                                className="w-5"
                            />
                        </div>
                        <div>
                            <label htmlFor="lookZ">Z:</label>
                            <input
                                type="range"
                                min="-30"
                                max="30"
                                defaultValue={lookZ}
                                step="0.1"
                                id="lookZ"
                                onChange={(e) => setLookZ(e.target.value)}
                            />
                            <input
                                id="lookZVal"
                                name="lookZVal"
                                value={lookZ}
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
                                defaultValue={lightX}
                                step="0.1"
                                id="lightX"
                                onChange={(e) => setLightX(e.target.value)}
                            />
                            <input
                                id="lightXVal"
                                name="lightXVal"
                                value={lightX}
                                className="w-5"
                            />
                        </div>
                        <div>
                            <label htmlFor="lightY">Y:</label>
                            <input
                                type="range"
                                min="-30"
                                max="30"
                                defaultValue={lightY}
                                step="0.1"
                                id="lightY"
                                onChange={(e) => setLightY(e.target.value)}
                            />
                            <input
                                id="lightYVal"
                                name="lightYVal"
                                value={lightY}
                                className="w-5"
                            />
                        </div>
                        <div>
                            <label htmlFor="lightZ">Z:</label>
                            <input
                                type="range"
                                min="-30"
                                max="30"
                                defaultValue={lightZ}
                                step="0.1"
                                id="lightZ"
                                onChange={(e) => setLightZ(e.target.value)}
                            />
                            <input
                                id="lightZVal"
                                name="lightZVal"
                                value={lightZ}
                                className="w-5"
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* CONTENT */}
            <div className="mx-1 my-4 flex max-w-prose flex-col items-center sm:mx-auto sm:items-start">
                <div className="mb-2 flex w-min flex-row  space-x-4">
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
            <div className="mt-10 flex w-full flex-col items-center">
                <h1 className="mb-2">Further Reading</h1>
                <div className="mt-4 flex flex-row flex-wrap space-x-4">
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
        </div>
    );
}
