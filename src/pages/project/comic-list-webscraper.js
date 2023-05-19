import { useRouter } from "next/router";
export default function Project() {
    let router = useRouter();
    let project = router.query;
    console.log(project);

    return (
        <div>
            <p>{project.name}</p>
        </div>
    );
}
