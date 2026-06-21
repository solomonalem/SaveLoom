//src/app/page.tsx
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import DashboardClient from "~/app/_components/DashboardClient";
import LandingPage from "~/app/_components/landing/LandingPage";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      {!session ? (
        <LandingPage />
      ) : (
        <DashboardClient
          user={{
            name: session.user?.name,
            image: session.user?.image,
          }}
        />
      )}
    </HydrateClient>
  );
}
