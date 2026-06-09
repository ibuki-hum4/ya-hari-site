"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { IoEyeOutline } from "react-icons/io5";

export default function FooterViewCounter() {
    const pathname = usePathname();
    const isHome = pathname === "/";

    const { data: visitors = null } = useQuery({
        queryKey: ["visitors", isHome ? "track" : "view"],
        queryFn: async () => {
            const res = isHome
                ? await fetch("/api/views", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ type: "site" }),
                  })
                : await fetch("/api/views?type=site");
            const data = await res.json();
            return data.count as number;
        },
    });

    return (
        <span className="inline-flex items-center gap-1">
            <IoEyeOutline size={14} />
            {visitors !== null ? `${visitors.toLocaleString()} visitors` : "..."}
        </span>
    );
}
