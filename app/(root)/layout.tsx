import { ReactNode } from "react";
import Navbar from "@/components/NavBar";
import { AppSessionTracker } from "@/components/AppSessionTracker";

export const dynamic = "force-dynamic";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <AppSessionTracker />
      <Navbar />
      <div className="root-layout">
        {/* <nav>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
            <h2 className="text-primary-100">PrepWise</h2>
          </Link>
        </nav> */}

        {children}
      </div>
    </>
  );
};

export default Layout;
