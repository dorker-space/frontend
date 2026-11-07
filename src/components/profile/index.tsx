import { useSearchParams } from "react-router-dom";
import { ProfileDisplay } from "./display";
import { ProfileForm } from "./form";

export function Profile() {
    const [searchParams] = useSearchParams();
    const isEditing = searchParams.get("update") === "true";

    if (isEditing) {
        return <ProfileForm />;
    }
    return <ProfileDisplay />;
}
