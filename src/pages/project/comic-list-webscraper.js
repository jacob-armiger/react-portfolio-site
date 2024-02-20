import { useRouter } from "next/router";
import Button from "@/components/Button";

export default function Project() {
    let router = useRouter();

    let project = null;
    if (router.query.object) {
        project = JSON.parse(router.query.object);
    }

    return (
        <div className="m-auto w-full content-center lg:w-8/12">
            <h1 className="my-4 text-center font-bold">{project?.name}</h1>
            <img className="" src={project?.image} />

            <div className="m-auto my-4 max-w-prose mx-1">
                <div className="flex w-min flex-row space-x-4">
                    <Button
                        url="https://github.com/jacob-armiger/comic-list-web-scraper"
                        title="Github Project"
                    />
                    <Button
                        url="https://www.comicbookreadingordersdownload.com"
                        title="Website"
                    />
                </div>
                <p>
                    This web app allows readers to keep track of things they’ve
                    read from{" "}
                    <a href="https://comicbookreadingorders.com">
                        comicbookreadingorders.com
                    </a>
                    . Each reading order is on its own page, so readers just
                    need to copy the URL and paste it into the prompt on my web
                    app.
                </p>
                <br />
                <p>
                    Originally this project started as a single Python script. I
                    didn’t think I would be creating a tool that other people
                    would use. Then I had the idea to contact the site owner and
                    ask if he was interested in a tool like this, and he said
                    he’s had users request similar features. My first idea was
                    to create a distributable executable, but after
                    multi-platform and signature issues I pivoted to a web app.
                </p>
                <br />
                <p>
                    My own web app has the same theme as{" "}
                    <a href="comicbookreadingorders.com">
                        comicbookreadingorders.com
                    </a>
                    , but it’s hosted separately and on a different domain name.
                    I’m not sure what the site owner is using for his website,
                    and it seems like they would be most happy with a hands off
                    approach. Therefore, I decided to simply emulate their
                    website theme and host it myself. It costs a few dollars a
                    month, but it’s worth it for the few dozen users I get.
                </p>
            </div>
        </div>
    );
}
