import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function RootPage() {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = savedLocale === "bn" ? "bn" : "en";
  redirect(`/${locale}`);
}
