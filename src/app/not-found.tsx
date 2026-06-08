"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FiZapOff } from "react-icons/fi";
import ErrorPage, { primaryActionClass, secondaryActionClass } from "./components/error-page";

export default function NotFound() {
    const t = useTranslations("error");

    return (
        <ErrorPage
            code={404}
            icon={<FiZapOff />}
            title={t("notFound.title")}
            description={t("notFound.description")}
            actions={
                <>
                    <Link href="/" className={primaryActionClass}>
                        {t("notFound.backHome")}
                    </Link>
                    <Link href="/contact" className={secondaryActionClass}>
                        {t("notFound.contact")}
                    </Link>
                </>
            }
        />
    );
}
