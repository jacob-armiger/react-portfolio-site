import Project from "@/components/Project";
export default function Projects() {
    let projects = [
        {
            name: "rendering-engine",
            image: "/graphic_render.png",
            description: "A rendering engine I built with WebGL 2.0",
            technologies: ["WebGL 2.0", "GLSL", "JavaScript"],
            link: "https://github.com/jacob-armiger/rendering-engine",
        },
        {
            name: "comic-list-webscraper",
            image: "/comic_list2.png",
            description:
                "A web application that dynamically wrangles data from pages on comicbookreadingorders.com to provide users a method to track reading progress.",
            technologies: ["Python", "Flask", "Web Scraping"],
            link: "https://www.comicbookreadingordersdownload.com/",
        },
        {
            name: "DevBlog",
            image: "/devblog.png",
            description:
                "A blog for developers that gives them a platform to inform users of product updates.",
            technologies: ["Python", "Django", "bootstrap", "Heroku"],
            link: "https://github.com/jacob-armiger/django-devblog/tree/master",
        },
    ];

    return (
        <div className="my-12 flex flex-col items-center gap-5">
            {projects.map((project_data) => (
                <Project key={project_data.name} project={project_data} />
            ))}
        </div>
    );
}
