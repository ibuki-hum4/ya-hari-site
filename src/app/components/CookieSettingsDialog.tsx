"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FiSettings } from "react-icons/fi";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { primaryButtonClass, secondaryButtonClass } from "./ui/button";
import { getCookieConsent, setCookieConsent, type ConsentStatus } from "../../lib/cookie-consent";

export default function CookieSettingsDialog() {
    const t = useTranslations("cookie");
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<ConsentStatus>("pending");

    const handleOpenChange = (next: boolean) => {
        if (next) setStatus(getCookieConsent());
        setOpen(next);
    };

    const choose = (next: "accepted" | "rejected") => {
        setCookieConsent(next);
        setStatus(next);
        toast.success(t(next === "accepted" ? "settingsAccepted" : "settingsRejected"));
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger className="inline-flex items-center gap-1.5 hover:text-ink transition-colors">
                <FiSettings size={14} />
                Cookie Settings
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>🍪 Cookie {t("settingsTitle")}</DialogTitle>
                <DialogDescription>{t("message")}</DialogDescription>
                <p className="text-xs text-muted mt-4">
                    {t("currentStatus")}:{" "}
                    <span className="text-ink font-medium">{t(`status.${status}`)}</span>
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                    <button onClick={() => choose("accepted")} className={primaryButtonClass}>
                        {t("accept")}
                    </button>
                    <button onClick={() => choose("rejected")} className={secondaryButtonClass}>
                        {t("decline")}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
