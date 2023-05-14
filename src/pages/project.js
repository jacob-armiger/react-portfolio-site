import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { useEffect, useState } from "react";

export default function Project() {
    let markdown = "# *This is markdown*";

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const scriptMain = document.createElement("script");
        scriptMain.src = "rendering-engine/bundle.js";
        scriptMain.async = true;
        scriptMain.type = "module";
        document.body.appendChild(scriptMain);

        scriptMain.addEventListener("load", () => setLoaded(true));
    }, []);

    useEffect(() => {
        if (!loaded) return;
    }, [loaded]);

    return (
        <div className="mt-8 flex flex-col items-center">
            {loaded ? "Script loaded" : "script not loaded"}
            <canvas id="glCanvas" width="640" height="480"></canvas>
            <br />
            <div className="w-1/2">
                <div className="float-left w-1/2">
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

            <ReactMarkdown className="markdown" children={markdown} />
        </div>
    );
}
