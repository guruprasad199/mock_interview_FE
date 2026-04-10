import { redirect } from "next/navigation";

import VoiceInterviewScheduler from "@/components/VoiceInterviewScheduler";
import { getCurrentUser } from "@/lib/actions/auth.action";

type InterviewPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const Page = async ({ searchParams }: InterviewPageProps) => {
  const user = await getCurrentUser();
  const resolvedSearchParams = await searchParams;

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <VoiceInterviewScheduler
      autoStart={resolvedSearchParams.autostart === "1"}
      userId={user.id}
      userName={user.name}
    />
  );
};

export default Page;
