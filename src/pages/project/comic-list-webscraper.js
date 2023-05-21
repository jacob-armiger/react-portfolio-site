import { useRouter } from "next/router";
export default function Project() {
    let router = useRouter();
    let project = JSON.parse(router.query.object);
    console.log(project);

    return (
        <div>
            <p>{project.name}</p>
        </div>
    );
}
