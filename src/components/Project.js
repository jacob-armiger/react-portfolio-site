import Link from "next/link";

export default function Project({ project }) {
    return (
        <Link
            href={{
                pathname: `/project/${project.name}`,
                query: { object: JSON.stringify(project) },
            }}
            className="flex h-[35rem] w-11/12 flex-col rounded-lg border border-b-[5px] border-black transition-all duration-150 hover:mb-0 hover:translate-y-[5px] hover:cursor-pointer hover:border md:w-8/12 lg:h-80 lg:w-10/12 lg:flex-row"
        >
            <img
                className="h-96 rounded-t-lg object-cover lg:h-auto lg:w-5/12 lg:rounded-none lg:rounded-l-lg"
                src={project.image}
                alt="Screenshot of project"
            />
            <div className="flex flex-1 flex-col p-3 lg:p-6">
                <p className="mb-2 text-xl font-medium">{project.name}</p>
                <p className="text-base">{project.description}</p>
                <div className="mt-auto flex flex-row gap-6 text-xs">
                    {project.technologies.map((tech) => (
                        <p key={tech}>{tech}</p>
                    ))}
                </div>
            </div>
        </Link>
    );
}
