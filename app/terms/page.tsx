import LegalPage from "@/components/legal/LegalPage";

export const metadata = { title: "Terms of Service · Zenex" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="August 2026"
      intro="These terms govern your use of Zenex. By creating an account or booking a service you agree to them. Please read the cancellation and payment sections carefully — they affect what you are charged."
      sections={[
        {
          heading: "What Zenex is",
          body: [
            "Zenex is a marketplace that connects clients with independent cleaning professionals. Zenex is not a cleaning company and does not employ the providers listed on the platform.",
            "Providers are independent contractors responsible for how they perform their work, their own tools and supplies, and their own tax obligations.",
          ],
        },
        {
          heading: "Accounts",
          body: [
            "You must provide accurate information and keep your login credentials secure. You are responsible for activity that happens under your account.",
            "Providers must be legally entitled to work in Canada and must not misrepresent their identity, insurance or qualifications.",
          ],
        },
        {
          heading: "Bookings and payment",
          body: [
            "Prices shown include the service price plus applicable Canadian sales tax (GST/HST, or GST plus QST in Quebec) based on where the service is performed.",
            "Payment is taken at the time of booking. Zenex retains a platform fee calculated on the pre-tax subtotal; the remainder is credited to the provider.",
            "Sales tax collected is held for remittance and is not shared with providers.",
          ],
        },
        {
          heading: "Cancellations and refunds",
          body: [
            "Cancel at least 24 hours before the scheduled start and you receive a full refund.",
            "Cancel within 24 hours of the scheduled start and 50% of the amount paid is refunded; the balance compensates the provider for the reserved time.",
            "Refunds are returned to the original payment method and may take several business days to appear.",
          ],
        },
        {
          heading: "Verification",
          body: [
            "Providers may submit government ID, insurance certificates and background checks for review. A verified badge indicates Zenex has reviewed those documents — it is not a guarantee of outcome or workmanship.",
            "If a provider's insurance lapses, the verified badge is automatically removed until current coverage is supplied.",
          ],
        },
        {
          heading: "Conduct and disputes",
          body: [
            "Harassment, discrimination, and attempts to move payment off-platform are prohibited and may result in account suspension.",
            "If something goes wrong with a booking, contact us so we can investigate. Zenex may mediate disputes but is not a party to the contract between client and provider.",
          ],
        },
        {
          heading: "Liability",
          body: [
            "Zenex provides the platform on an as-is basis. To the extent permitted by law, our liability arising from your use of Zenex is limited to the amount you paid for the booking in question.",
            "Nothing in these terms limits liability that cannot be limited under applicable Canadian consumer protection law.",
          ],
        },
      ]}
    />
  );
}
