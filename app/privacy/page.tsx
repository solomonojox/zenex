import LegalPage from "@/components/legal/LegalPage";

export const metadata = { title: "Privacy Policy · Zenex" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="August 2026"
      intro="Zenex connects clients with cleaning professionals across Canada. This policy explains what personal information we collect, why we collect it, and the choices you have. We aim to handle personal information in line with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA)."
      sections={[
        {
          heading: "Information we collect",
          body: [
            "Account information: your name, email address, phone number and password (stored only as a cryptographic hash — we never store your password itself).",
            "Booking information: the service address you provide, access notes, appointment times, and the services you book.",
            "Provider verification documents: government ID, insurance certificates, background checks and business registration, where you choose to submit them.",
            "Payment information: payment card details are collected and processed by Stripe. Zenex does not store full card numbers on its own servers.",
            "Usage information: messages you send through the platform, reviews you write, and basic technical logs.",
          ],
        },
        {
          heading: "Why we collect it",
          body: [
            "To create and secure your account, match you with providers, take payment, and deliver the service you booked.",
            "To verify that providers are who they say they are and hold valid insurance — this is central to trust and safety on the platform.",
            "To send transactional messages such as booking confirmations, reminders and receipts.",
          ],
        },
        {
          heading: "Who we share it with",
          body: [
            "With the other party to a booking: a provider receives the service address and access notes needed to do the job; a client sees the provider's name and profile. Email addresses are not exchanged.",
            "With service providers who operate parts of the platform on our behalf: Supabase (database and document storage), Stripe (payments), and Resend (transactional email).",
            "We do not sell personal information.",
          ],
        },
        {
          heading: "Storage and security",
          body: [
            "Data is stored in Supabase's Canadian region. Verification documents are held in a private bucket and served only through short-lived signed links.",
            "Passwords are hashed with argon2 and sessions use short-lived access tokens with revocable refresh tokens.",
          ],
        },
        {
          heading: "Retention",
          body: [
            "We keep account and booking records for as long as your account is active, and afterwards only as long as needed for legal, tax and dispute-resolution purposes.",
            "Verification documents are retained while you operate as a provider on Zenex.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "Under PIPEDA you may request access to the personal information we hold about you, ask for corrections, or ask us to delete your account.",
            "To make a request, contact privacy@zenex.ca. We will respond within 30 days.",
          ],
        },
      ]}
    />
  );
}
