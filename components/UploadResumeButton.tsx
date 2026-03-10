"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
    isLoggedIn: boolean;
};

export default function UploadResumeButton({ isLoggedIn }: Props) {
    const router = useRouter();


    console.log("isLoggedIn", isLoggedIn)
    const handleClick = () => {
        router.push(isLoggedIn ? "/interview" : "/sign-in");
    };

    return (
        <Button
            onClick={handleClick}
            className="btn-primary max-sm:w-full"
        >
            Upload Resume
        </Button>
    );
}
