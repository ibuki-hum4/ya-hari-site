"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FiServer } from "react-icons/fi";
import ErrorPage, { primaryActionClass, secondaryActionClass } from "../components/error-page";

export default function InternalServerError() {
    const t = useTranslations("error");

    return (
        <ErrorPage
            code={500}
            icon={<FiServer className="text-red-500" />}
            title={t("serverError.title")}
            description={t("serverError.description")}
            actions={
                <>
                    <Link href="/" className={primaryActionClass}>
                        {t("serverError.backHome")}
                    </Link>
                    <button onClick={() => window.location.reload()} className={secondaryActionClass}>
                        {t("serverError.retry")}
                    </button>
                </>
            }
        />
    );
}
