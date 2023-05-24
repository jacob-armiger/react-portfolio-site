import { useRouter } from "next/router";
export default function Project() {
    let router = useRouter();

    let project = null;
    if (router.query.object) {
        project = JSON.parse(router.query.object);
    }

    return (
        <div>
            <p>{project?.name}</p>
        </div>
    );
}
