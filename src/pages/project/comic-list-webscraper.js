import { useRouter } from "next/router";
import Link from "next/link";
import Button from "@/components/Button";

export default function Project() {
    let router = useRouter();

    let project = null;
    if (router.query.object) {
        project = JSON.parse(router.query.object);
    }

    return (
        <div className="flex w-full flex-col items-center justify-center">
            <h1 className="my-4 font-bold">{project?.name}</h1>
            <img className="rounded" src={project?.image} />

            <div className="mx-1 my-4 flex max-w-prose flex-col items-center sm:items-start">
                <div className="mb-2 flex w-min flex-row space-x-4">
                    <Button
                        url="https://github.com/jacob-armiger/comic-list-web-scraper"
                        title="Github Project"
                    />
                    <Button
                        url="https://www.comicbookreadingordersdownload.com"
                        title="Project Website"
                    />
                </div>
                <p>
                    This web app allows readers to keep track of things they’ve
                    read from{" "}
                    <Link
                        className="text-cyan-700"
                        href="https://comicbookreadingorders.com"
                    >
                        comicbookreadingorders.com
                    </Link>
                    . Each reading order is on its own page, so readers just
                    need to copy the URL and paste it into the prompt on my web
                    app.
                    <br />
                    <br />
                    Originally this project started as a single Python script. I
                    didn’t think I would be creating a tool that other people
                    would use. Then I had the idea to contact the site owner and
                    ask if he was interested in a tool like this, and he said
                    he’s had users request similar features. My first idea was
                    to create a distributable executable, but after
                    multi-platform and signature issues I pivoted to a web app.
                    <br />
                    <br />
                    My own web app has the same theme as{" "}
                    <Link
                        className="text-cyan-700"
                        href="comicbookreadingorders.com"
                    >
                        comicbookreadingorders.com
                    </Link>
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
