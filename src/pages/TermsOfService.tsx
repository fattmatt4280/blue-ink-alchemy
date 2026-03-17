
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-4">BlueDreamBudder.com — operated by Dream Tattoo Company LLC</p>
          <p className="text-sm text-gray-600 mb-8">Effective Date: 10-1-2025</p>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-purple-900 mb-2">🤖 DreamOps Command Center — Automated TikTok Bot Disclosure</h2>
              <p className="text-sm text-purple-800">
                Dream Tattoo Company LLC operates an automated TikTok bot known as <strong>"DreamOps Command Center"</strong>. 
                This bot may interact with users on the TikTok platform through automated comments, messages, and content distribution 
                on behalf of Blue Dream Budder™. By engaging with our TikTok content or DreamOps Command Center, you acknowledge that 
                some interactions may be automated and agree to these Terms of Service and our Privacy Policy.
              </p>
            </div>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1) Agreement to Terms</h2>
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement between Dream Tattoo Company LLC ("Company," "we," "us," or "our") and you ("you," "user") governing your access to and use of BlueDreamBudder.com, our online store, and all related tools, features, and services, including Heal-AId (AI Tattoo Healing Assistant) (collectively, the "Services"). By accessing or using the Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not use the Services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2) Eligibility</h2>
              <p>
                You must be at least 18 years old (or the age of majority where you live) to use Heal-AId and to purchase products. By using the Services, you represent that you meet this requirement and are legally able to enter into these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3) The Services</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Website & Store.</strong> We sell aftercare and skincare products and provide informational content.</li>
                <li><strong>Heal-AId.</strong> Users may upload tattoo images for automated analysis and a generated report with observations and general self-care suggestions.</li>
              </ul>
              <p className="mt-3">
                We may add, modify, suspend, or discontinue any part of the Services at any time with or without notice. Certain features may be labeled beta or experimental and are provided as-is.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4) No Medical Advice; Not a Medical Device</h2>
              <p className="font-semibold text-red-600 mb-2">
                The Services (including Heal-AId) are for informational and educational purposes only and are not medical advice, diagnosis, or treatment.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The AI output is generated programmatically from images and inputs you provide and may be incomplete, inaccurate, or inapplicable to your situation.</li>
                <li>The Services are not a substitute for in-person evaluation by a licensed physician, dermatologist, or other qualified healthcare professional.</li>
                <li>If you observe red-flag symptoms (e.g., rapidly spreading redness, warmth, severe swelling, pustules, fever, red streaking, severe pain, allergic reaction), seek medical attention immediately.</li>
                <li>Statements about products (including any containing botanical ingredients or hemp-derived ingredients) have not been evaluated by the FDA. Products are not intended to diagnose, treat, cure, or prevent any disease.</li>
                <li>We are not a HIPAA-covered entity, and the Services are not intended for the transmission of Protected Health Information.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5) Accounts; Electronic Communications</h2>
              <p>
                You may need an account to access certain features. You agree to provide accurate information and keep it current. You are responsible for activities under your account. By using the Services, you consent to receive electronic communications (email/SMS/push) related to your account, purchases, and service updates. You may opt out of marketing messages as described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6) User Content & License</h2>
              <p className="mb-2">User Content includes images, text, data, and other materials you submit. You represent and warrant that:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>You own or have the necessary rights to submit the User Content;</li>
                <li>Your User Content does not infringe any third-party rights, violate law, or depict unlawful or prohibited content;</li>
                <li>You will not upload images of others without their consent or images of minors.</li>
              </ul>
              <p className="mb-2"><strong>License to Us.</strong> Solely to operate and improve the Services, you grant us a worldwide, non-exclusive, royalty-free, sublicensable license to host, process, reproduce, and display your User Content. If you opt in, you also grant us the right to use de-identified/aggregated data to improve models and features.</p>
              <p><strong>Prohibited Content.</strong> Do not upload: illegal content; intimate/sexual content; hate/harassment; malware; content that invades privacy; or content that violates these Terms or applicable law. We may remove or disable access to any User Content at our discretion.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7) Intellectual Property; Reservation of Rights</h2>
              <p className="mb-2">
                The Services, including all software, models, prompts, designs, text, graphics, logos, trade dress, and compilations, are owned by Dream Tattoo Company LLC or our licensors and are protected by copyright, trademark, and other laws. Except for the limited rights expressly granted herein, we reserve all rights.
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>You may not copy, modify, distribute, sell, lease, reverse engineer, or scrape the Services or any outputs except as expressly permitted by these Terms.</li>
                <li>You may print or download your own Tracker reports for personal, non-commercial use.</li>
              </ul>
              <p><strong>Trademarks.</strong> "Blue Dream Budder," related marks, logos, product and service names are our trademarks. You may not use them without our prior written consent.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8) Acceptable Use; Security</h2>
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access or use the Services for competitive analysis, model extraction, or to build a competing product;</li>
                <li>Probe, scan, or test system vulnerabilities or circumvent security;</li>
                <li>Use bots or automated methods to scrape or harvest data;</li>
                <li>Interfere with or disrupt the Services or impose an unreasonable load.</li>
              </ul>
              <p className="mt-2">We may monitor use for abuse, rate-limit, suspend, or terminate accounts that violate these Terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9) Purchases; Pricing; Returns</h2>
              <p className="mb-2">
                Purchases from our store are subject to posted pricing, taxes, shipping, and Return/Refund policies (incorporated by reference). We may correct pricing errors and cancel orders at our discretion (we will refund any charges if we cancel). You agree to provide valid payment information and authorize us (and our payment processors) to charge your payment method.
              </p>
              <p><strong>Regulatory/Geographic Limits.</strong> Some products may be restricted or unavailable in certain jurisdictions. You are responsible for compliance with your local laws.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10) Third-Party Services & Links</h2>
              <p>
                The Services may integrate third-party platforms (e.g., hosting providers, analytics, payment processors, AI model providers). We are not responsible for third-party services and disclaim all liability arising from them. Your use of third-party services may be governed by their terms and privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11) Privacy</h2>
              <p>
                Your use of the Services is subject to our Privacy Policy (incorporated by reference). By using Heal-AId, you consent to the processing of your uploaded images and related data as described in the Privacy Policy. Do not upload sensitive personal data you do not wish to share.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12) Disclaimers</h2>
              <p className="uppercase font-semibold">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICES (INCLUDING HEAL-AID AND ALL OUTPUTS) AND ALL CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT, AND ANY WARRANTIES ARISING OUT OF COURSE OF DEALING OR USAGE. WE DO NOT WARRANT THAT THE SERVICES WILL BE ACCURATE, RELIABLE, ERROR-FREE, OR UNINTERRUPTED, OR THAT DEFECTS WILL BE CORRECTED.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13) Limitation of Liability</h2>
              <p className="uppercase font-semibold mb-2">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL WE OR OUR AFFILIATES, OFFICERS, EMPLOYEES, AGENTS, SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES; LOST PROFITS; LOSS OF DATA; PERSONAL INJURY; PROPERTY DAMAGE; OR COST OF SUBSTITUTE GOODS OR SERVICES, ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF (OR INABILITY TO USE) THE SERVICES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p className="uppercase font-semibold mb-2">
                OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING OUT OF OR RELATING TO THE SERVICES SHALL NOT EXCEED THE GREATER OF (A) $100 OR (B) THE AMOUNT YOU PAID TO US FOR THE SERVICES IN THE 12 MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
              </p>
              <p>Some jurisdictions do not allow certain limitations; in those cases, our liability will be limited to the maximum extent permitted by law.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">14) Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless Dream Tattoo Company LLC, our affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) your use of the Services; (b) your User Content; (c) your violation of these Terms or applicable law; or (d) your violation of any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">15) DMCA & IP Complaints</h2>
              <p>
                We respect intellectual property rights. If you believe content on the Services infringes your copyright, send a notice containing the information required by 17 U.S.C. §512(c)(3) to support@bluedreambudder.com with subject line "DMCA Notice." We may remove content and terminate repeat infringers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">16) Suspension; Termination</h2>
              <p>
                We may suspend or terminate your access to the Services at any time, with or without notice, for any reason, including violation of these Terms. Upon termination, provisions that by their nature should survive (e.g., IP, disclaimers, limitations of liability, indemnification, dispute resolution) will survive.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">17) Governing Law; Venue</h2>
              <p>
                These Terms are governed by the laws of the State of Indiana, without regard to conflict-of-laws rules. Subject to Section 18 (Arbitration), you consent to exclusive jurisdiction and venue in the state and federal courts located in Porter County, Indiana.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">18) Binding Arbitration; Class Action Waiver</h2>
              <p className="font-semibold mb-2">PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR RIGHTS.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Arbitration.</strong> Any dispute, claim, or controversy arising out of or relating to these Terms or the Services will be resolved by binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. The arbitration will be conducted in Porter County, Indiana, by a single arbitrator.</li>
                <li><strong>No Class Actions.</strong> You and we agree to bring disputes only on an individual basis and not as a plaintiff or class member in any purported class, consolidated, or representative action.</li>
                <li><strong>Injunctive Relief.</strong> Notwithstanding the foregoing, either party may seek injunctive or other equitable relief in court for actual or threatened infringement or misappropriation of intellectual property rights.</li>
                <li><strong>Opt-Out.</strong> You may opt out of arbitration within 30 days of first agreeing to these Terms by sending written notice to support@bluedreambudder.com with your name, account email, and a clear statement that you wish to opt out.</li>
                <li><strong>Small Claims.</strong> You may bring an individual claim in small claims court in your county of residence or Porter County, Indiana, if your claim qualifies.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">19) Export & Sanctions</h2>
              <p>
                You may not use or export the Services in violation of U.S. export laws or applicable sanctions. You represent that you are not located in, under the control of, or a national or resident of any restricted country or on any restricted party list.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">20) Force Majeure</h2>
              <p>
                We will not be liable for any delay or failure to perform due to events beyond our reasonable control, including acts of God, labor conditions, internet failures, power outages, governmental actions, or other force majeure events.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">21) Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. The "Effective Date" will reflect the latest revision. Your continued use of the Services following any update constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">22) Miscellaneous</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Severability.</strong> If any provision is held invalid, the remaining provisions remain in full force.</li>
                <li><strong>Assignment.</strong> You may not assign these Terms without our prior written consent; we may assign them without restriction.</li>
                <li><strong>Entire Agreement.</strong> These Terms and the documents incorporated by reference (including the Privacy Policy and any product-specific policies) are the entire agreement between you and us regarding the Services.</li>
                <li><strong>No Waiver.</strong> Our failure to enforce a provision is not a waiver of our right to do so later.</li>
                <li><strong>Headings.</strong> Headings are for convenience only and do not affect interpretation.</li>
                <li><strong>Language.</strong> These Terms are provided in English; translations (if any) are for convenience and the English version controls.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">23) Contact</h2>
              <p>Dream Tattoo Company LLC / Blue Dream Budder</p>
              <p>5474 US Hwy 6, Portage, IN 46368</p>
              <p>Email: support@bluedreambudder.com</p>
              <p>Phone: (331) 643-5463</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
