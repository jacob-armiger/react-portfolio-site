import { useRouter } from "next/router";
export default function Project() {
    let router = useRouter();

    let project = null;
    if (router.query.object) {
        project = JSON.parse(router.query.object);
    }

    return (
        <div className="m-auto w-8/12 content-center">
            <h1 className="my-4 text-center font-bold">{project?.name}</h1>
            <img className="" src={project?.image} />
            <div className="flex flex-col items-center justify-center sm:flex-row">
                <a
                    className="rich-link"
                    target="_blank"
                    href="https://github.com/jacob-armiger/django-devblog"
                >
                    Github
                </a>
            </div>
            <p>*Under Construction*</p>
        </div>
    );
}
