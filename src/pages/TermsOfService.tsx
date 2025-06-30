
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
          <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Blue Dream Budder's website and services, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Product Information</h2>
              <p>
                Blue Dream Budder provides CBD-infused tattoo aftercare products. All product information, including ingredients and usage instructions, is provided for informational purposes. Results may vary by individual.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Age Restrictions</h2>
              <p>
                You must be at least 18 years old to purchase our products. By making a purchase, you confirm that you are of legal age in your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Orders and Payment</h2>
              <p>
                All orders are subject to availability and confirmation. We reserve the right to refuse any order. Payment must be made in full before products are shipped.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Shipping and Returns</h2>
              <p>
                We strive to ship orders promptly. Return policies are available on our website. Damaged or defective products may be returned within 30 days of purchase.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Disclaimer</h2>
              <p>
                These statements have not been evaluated by the FDA. Our products are not intended to diagnose, treat, cure, or prevent any disease. Consult your healthcare provider before use.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
              <p>
                Blue Dream Budder shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at hello@bluedreambudder.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
