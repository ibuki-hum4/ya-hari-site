"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FiAlertCircle } from "react-icons/fi";
import ErrorPage, { primaryActionClass } from "../components/error-page";

export default function BadRequest() {
    const t = useTranslations("error");

    return (
        <ErrorPage
            code={400}
            icon={<FiAlertCircle className="text-yellow-500" />}
            title={t("badRequest.title")}
            description={t("badRequest.description")}
            actions={
                <Link href="/" className={primaryActionClass}>
                    {t("badRequest.backHome")}
                </Link>
            }
        />
    );
}
