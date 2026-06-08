"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { FiServer } from "react-icons/fi";
import ErrorPage, { primaryActionClass, secondaryActionClass } from "./components/error-page";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    const t = useTranslations("error");

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <ErrorPage
            code={500}
            icon={<FiServer />}
            title={t("serverError.title")}
            description={t("serverError.description")}
            actions={
                <>
                    <button onClick={() => reset()} className={primaryActionClass}>
                        {t("serverError.retry")}
                    </button>
                    <Link href="/" className={secondaryActionClass}>
                        {t("serverError.backHome")}
                    </Link>
                </>
            }
        />
    );
}
