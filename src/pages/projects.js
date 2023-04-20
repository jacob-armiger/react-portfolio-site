import Card from "@/components/Card";
export default function Projects() {

  let projects = [
    {
      name: "comic-list-webscraper",
      image: "/comic_list.png",
      description:
        "This project uses a web scraper to gather a comic book reading order from this website and formats the data into a csv file. You can upload the csv file to Excel and make a checklist of comics you've read.",
      technologies: ["Python", "Flask", "Web Scraping"],
      link: "",
    },
    {
      name: "Django dev-blog",
      image: "/devblog.png",
      description:
        "This is a blog website that can be used to give your users updates on project development! There are page tabs for each project team and a comment system.",
      technologies: ["Python", "Django", "bootstrap", "Heroku"],
      link: "",
    },
  ];

  return (
    <div className="mt-12 flex flex-col items-center space-y-6">
      {projects.map((project_data) => (
        <Card key={project_data.name} project={project_data} />
      ))}
    </div>
  );
}