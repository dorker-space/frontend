import { useSearchParams } from "react-router-dom";
import { FolderKanbanIcon, UserIcon } from "lucide-react";
import { Profile } from "@/components/profile";
import { DossierTab } from "@/components/profile/dossier-tab";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

export function ProfilePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab =
        searchParams.get("tab") === "dossier" ? "dossier" : "general";

    const handleTabChange = (nextTab: string) => {
        const nextParams = new URLSearchParams(searchParams);
        if (nextTab === "general") {
            nextParams.delete("tab");
        } else {
            nextParams.set("tab", nextTab);
            nextParams.delete("update");
        }
        setSearchParams(nextParams);
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
                <div>
                    <h1 className="text-lg font-medium">
                        Profile & Preferences
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Manage your general contact information and reusable
                        Dossier evidence library
                    </p>
                </div>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
            >
                <TabsList className="mb-3">
                    <TabsTrigger value="general" className="gap-1.5">
                        <UserIcon className="size-3.5" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="dossier" className="gap-1.5">
                        <FolderKanbanIcon className="size-3.5" />
                        Dossier
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Profile />
                </TabsContent>

                <TabsContent value="dossier">
                    <DossierTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
