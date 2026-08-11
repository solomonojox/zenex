import LegalPage from "@/components/legal/LegalPage";

export const metadata = { title: "Cookie Policy · Zenex" };

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      updated="August 2026"
      intro="This page explains the small amount of data Zenex stores in your browser and why."
      sections={[
        {
          heading: "What we store",
          body: [
            "Zenex keeps your session tokens in your browser's local storage so you stay signed in between visits. Clearing your browser storage signs you out.",
            "We do not currently use advertising or cross-site tracking cookies.",
          ],
        },
        {
          heading: "Third parties",
          body: [
            "Stripe sets its own cookies when you enter card details, to detect fraud and secure the payment. See Stripe's cookie policy for details.",
          ],
        },
        {
          heading: "Your choices",
          body: [
            "You can clear stored data at any time through your browser settings. Doing so will sign you out of Zenex but will not delete your account.",
          ],
        },
      ]}
    />
  );
}
