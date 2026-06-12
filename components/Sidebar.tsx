"use client";

import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "./Footer";
import PlaidLink from "./PlaidLink";
import { ThemeToggle } from "./ThemeToggle";
import { Megaphone } from "lucide-react";
import { repoIssueUrl } from "./ReportBug";

const Sidebar = ({ user }: SiderbarProps) => {
  const pathname = usePathname();

  return (
    <section className="sidebar">
      <nav className="flex flex-col gap-4">
        <Link href="/" className="mb-12 cursor-pointer flex items-center gap-2">
          <Image
            src="/icons/logo.svg"
            width={34}
            height={34}
            alt="NextBank logo"
            className="size-[24px] max-xl:size-14"
          />
          <h1 className="sidebar-logo">NextBank</h1>
        </Link>

        {sidebarLinks.map((item) => {
          const isActive =
            pathname === item.route || pathname.startsWith(`${item.route}/`);

          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn("sidebar-link", { "bg-bank-gradient": isActive })}
            >
              <div className="relative size-6">
                <Image
                  src={item.imgURL}
                  alt={item.label}
                  fill
                  className={cn({
                    "brightness-[3] invert-0": isActive,
                  })}
                />
              </div>
              <p className={cn("sidebar-label", { "!text-white": isActive })}>
                {item.label}
              </p>
            </Link>
          );
        })}

        <PlaidLink user={user} variant="ghost" />
      </nav>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex justify-center xl:justify-start px-2 py-2 max-md:hidden">
          <ThemeToggle />
        </div>

        <a
          href={repoIssueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-2 py-2 text-14 font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white xl:justify-start lg:hidden"
        >
          <Megaphone size={20} />
          <p className="max-xl:hidden">Report a Bug</p>
        </a>

        <Footer user={user} />
      </div>
    </section>
  );
};

export default Sidebar;
