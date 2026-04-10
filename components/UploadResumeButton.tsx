"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
    isLoggedIn: boolean;
};

export default function UploadResumeButton({ isLoggedIn }: Props) {
    const router = useRouter();

    const handleClick = () => {
        router.push(isLoggedIn ? "/interview?autostart=1" : "/sign-in");
    };

    return (
        <Button
            onClick={handleClick}
            className="btn-primary max-sm:w-full"
        >
            Schedule Interview
        </Button>
    );
}
