
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-4">BlueDreamBudder.com — operated by Dream Tattoo Company LLC</p>
          <p className="text-sm text-gray-600 mb-8">Effective Date: October 1, 2025</p>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-purple-900 mb-2">🤖 DreamOps Command Center — Automated TikTok Bot Disclosure</h2>
              <p className="text-sm text-purple-800">
                Dream Tattoo Company LLC operates an automated TikTok bot known as <strong>"DreamOps Command Center"</strong>. 
                This bot may collect and process limited interaction data (e.g., usernames, comments, engagement metrics) 
                from public TikTok interactions for marketing and analytics purposes. Any data collected through DreamOps Command Center 
                is handled in accordance with this Privacy Policy. By engaging with our TikTok content or DreamOps Command Center, 
                you acknowledge this automated data collection.
              </p>
            </div>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p>
                This Privacy Policy explains how Dream Tattoo Company LLC / Blue Dream Budder ("we," "our," or "us") collects, uses, and safeguards personal information when you use our website, online store, and services, including Heal-AId (AI Tattoo Healing Assistant) (the "Services"). By using the Services, you consent to the practices described in this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              <p>We collect the following categories of information:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Personal Information You Provide:</strong> Name, email, billing and shipping address, payment details, and other information you submit when making purchases or creating an account.</li>
                <li><strong>Uploaded Images:</strong> Tattoo photos and any related details you provide when using Heal-AId.</li>
                <li><strong>Generated Reports:</strong> AI-generated summaries and recommendations derived from your uploaded images.</li>
                <li><strong>Device & Usage Data:</strong> IP address, browser type, operating system, referral source, interactions with our site, cookies, and analytics data.</li>
                <li><strong>Communications:</strong> Information you provide when contacting us, subscribing to newsletters, or engaging with customer service.</li>
              </ul>
              <p className="mt-3">
                We do not intentionally collect information from individuals under 13 years of age (or 16 where applicable).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Information</h2>
              <p>We use collected data to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Provide Services, including generating tattoo healing analysis reports.</li>
                <li>Fulfill product orders and manage your account.</li>
                <li>Improve accuracy, performance, and security of our AI tools.</li>
                <li>Send service updates, promotions, or newsletters (opt-in only).</li>
                <li>Comply with applicable legal, regulatory, or enforcement requests.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. AI Processing & Health-Related Data Disclaimer</h2>
              <ul className="list-disc ml-6 space-y-1">
                <li>Uploaded tattoo images may contain health-related information (skin conditions, healing progress, allergic reactions).</li>
                <li>These images are used only for generating AI-based educational reports and are not shared publicly.</li>
                <li>Heal-AId is not a medical device and is not regulated as one.</li>
                <li>We are not a HIPAA-covered entity, and the Services are not designed for transmission or storage of Protected Health Information (PHI).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Storage & Retention</h2>
              <ul className="list-disc ml-6 space-y-1">
                <li>Uploaded tattoo photos are processed securely and stored temporarily unless you choose to save them to your account.</li>
                <li>Reports may be stored for your account history.</li>
                <li>We retain personal data only as long as necessary to provide Services, comply with law, or resolve disputes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Sharing of Information</h2>
              <p>We do not sell personal data. We may share limited information with:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Service Providers:</strong> Hosting, analytics, AI providers, and payment processors who assist in operating the Services.</li>
                <li><strong>Legal Compliance:</strong> If required by law, regulation, or court order.</li>
                <li><strong>Business Transfers:</strong> In the event of merger, acquisition, or sale of assets, your data may be transferred subject to this Privacy Policy.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Security</h2>
              <p>
                We use industry-standard safeguards to protect data from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Request access to or a copy of your data.</li>
                <li>Request correction or deletion of your data.</li>
                <li>Opt out of marketing communications.</li>
                <li>Restrict or object to processing.</li>
                <li>Request portability of your personal data.</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, contact us at support@bluedreambudder.com.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. International Users</h2>
              <p>
                Our Services are operated in the United States. If you access them from outside the U.S., you consent to transfer and processing of your data in the U.S., which may have different data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Third-Party Links & Services</h2>
              <p>
                Our website may contain links to third-party sites or services. We are not responsible for the privacy practices or content of third parties. Your interactions with third-party services are governed by their own terms and policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Children's Privacy</h2>
              <p>
                Our Services are not intended for individuals under 13 years of age (or 16 in jurisdictions with stricter laws). If we learn we have collected information from a child without verifiable consent, we will delete it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Updates to Privacy Policy</h2>
              <p>
                We may revise this Privacy Policy from time to time. Updates will be posted on this page with a revised "Effective Date." Your continued use of the Services constitutes acceptance of any updates.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our data practices, contact us at:
              </p>
              <div className="mt-3 ml-6">
                <p className="font-semibold">Dream Tattoo Company LLC / Blue Dream Budder™</p>
                <p>5474 US Hwy 6</p>
                <p>Portage, IN 46368</p>
                <p>Email: support@bluedreambudder.com</p>
                <p>Phone: (331) 643-5463</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
