export default function Card({ project }) {
  return (
    <div className="mx-4 flex flex-col rounded-lg border border-b-4 border-black lg:m-0 lg:h-52 lg:h-80 lg:w-10/12 lg:flex-row">
      <img
        className="h-96 rounded-t-lg object-cover lg:h-auto lg:rounded-none lg:rounded-l-lg"
        src={project.image}
        alt="Screenshot of project"
      />
      <div className="flex flex-col justify-start justify-between p-6">
        <p className="mb-2 text-xl font-medium">{project.name}</p>
        <p className="mb-4 text-base lg:mb-28">{project.description}</p>
        <div className="flex flex-row space-x-6 text-xs ">
          {project.technologies.map((tech) => (
            <p key={tech}>{tech}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
