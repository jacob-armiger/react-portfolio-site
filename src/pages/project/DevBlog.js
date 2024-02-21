import { useRouter } from "next/router";
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
            <img className="" src={project?.image} />
            {/* Content */}
            <div className="mx-1 my-4 flex max-w-prose flex-col items-center sm:items-start">
                <div className="mb-2 flex w-min flex-row space-x-4">
                    <Button
                        url="https://github.com/jacob-armiger/django-devblog"
                        title="Project Github"
                    />
                </div>
                <p>
                    This is the first personal project I worked on way back in
                    2019 when I was in the army. After reading through Python
                    Crash Course by Eric Matthes, where I learned Python and
                    Django, I tried making my own custom website. I used Django
                    to implement comments, admin users, blog creation, and blog
                    filtering. I also hosted the project through Heroku.
                    <br />
                    <br />
                    Unfortunately, I no longer host it so it cannot be visited,
                    but feel free to check out my code (at your own risk) at the
                    Github link.
                </p>
            </div>
        </div>
    );
}
