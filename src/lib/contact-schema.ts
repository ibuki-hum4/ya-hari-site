import { z } from "zod";

// クライアント・APIルート両方で共有するお問い合わせフォームのバリデーションスキーマ
export const contactFormSchema = z.object({
    name: z.string().trim().min(1, "nameRequired"),
    email: z.string().trim().min(1, "emailRequired").pipe(z.email("emailInvalid")),
    type: z.string(),
    subject: z.string().trim().min(1, "subjectRequired"),
    message: z.string().trim().min(1, "messageRequired").max(5000, "messageTooLong"),
    turnstileToken: z.string(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ContactValidationKey =
    | "nameRequired"
    | "emailRequired"
    | "emailInvalid"
    | "subjectRequired"
    | "messageRequired"
    | "messageTooLong";
