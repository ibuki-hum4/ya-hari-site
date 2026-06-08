"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { TbTeapot } from "react-icons/tb";
import ErrorPage, { primaryActionClass, secondaryActionClass } from "../components/error-page";

export default function Teapot() {
    const t = useTranslations("error");

    return (
        <ErrorPage
            code={418}
            icon={<TbTeapot className="text-amber-600 dark:text-amber-400 animate-bounce" />}
            title={t("teapot.title")}
            description={t("teapot.description")}
            note={t("teapot.rfc")}
            actions={
                <>
                    <Link href="/" className={primaryActionClass}>
                        {t("teapot.backHome")}
                    </Link>
                    <a
                        href="https://developer.mozilla.org/docs/Web/HTTP/Status/418"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={secondaryActionClass}
                    >
                        {t("teapot.learnMore")}
                    </a>
                </>
            }
        />
    );
}
