import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendMassEmailRequest {
  campaignId?: string;
  subject?: string;
  htmlContent?: string;
  filterTags?: string[];
  testEmail?: string; // For sending a test email
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { campaignId, subject, htmlContent, filterTags, testEmail }: SendMassEmailRequest = await req.json();

    console.log("Send mass email request:", { campaignId, subject, filterTags, testEmail });

    // If test email, just send one email
    if (testEmail) {
      console.log("Sending test email to:", testEmail);
      
      const testHtml = htmlContent || "<p>This is a test email</p>";
      const testSubject = subject || "Test Email";
      
      const { error: sendError } = await resend.emails.send({
        from: "Dream Tattoo Company <noreply@dreamtattoocompany.com>",
        to: [testEmail],
        subject: `[TEST] ${testSubject}`,
        html: testHtml,
      });

      if (sendError) {
        console.error("Test email failed:", sendError);
        throw new Error(`Failed to send test email: ${sendError.message}`);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Test email sent" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get campaign if ID provided
    let campaign;
    let emailSubject = subject;
    let emailHtml = htmlContent;

    if (campaignId) {
      const { data: campaignData, error: campaignError } = await supabase
        .from("email_campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      if (campaignError || !campaignData) {
        throw new Error("Campaign not found");
      }

      campaign = campaignData;
      emailSubject = campaign.subject;
      emailHtml = campaign.html_content;

      // Update campaign status to sending
      await supabase
        .from("email_campaigns")
        .update({ status: "sending" })
        .eq("id", campaignId);
    }

    if (!emailSubject || !emailHtml) {
      throw new Error("Subject and HTML content are required");
    }

    // Get subscribed contacts
    let query = supabase
      .from("marketing_contacts")
      .select("*")
      .eq("subscribed", true);

    // Apply tag filter if provided
    const tagsToFilter = filterTags || campaign?.filter_tags;
    if (tagsToFilter && tagsToFilter.length > 0) {
      query = query.overlaps("tags", tagsToFilter);
    }

    const { data: contacts, error: contactsError } = await query;

    if (contactsError) {
      console.error("Error fetching contacts:", contactsError);
      throw new Error("Failed to fetch contacts");
    }

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No subscribed contacts found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending to ${contacts.length} contacts`);

    // Update campaign total recipients
    if (campaignId) {
      await supabase
        .from("email_campaigns")
        .update({ total_recipients: contacts.length })
        .eq("id", campaignId);
    }

    let successCount = 0;
    let failCount = 0;
    const baseUrl = "https://preview--budder-tattoo-care.lovable.app";

    // Send emails in batches
    for (const contact of contacts) {
      try {
        // Add unsubscribe link
        const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${contact.unsubscribe_token}`;
        const personalizedHtml = emailHtml
          .replace(/\{\{first_name\}\}/g, contact.first_name || "there")
          .replace(/\{\{email\}\}/g, contact.email)
          + `<br><br><p style="font-size: 12px; color: #666; text-align: center;">
              <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a> from these emails
            </p>`;

        const { error: sendError } = await resend.emails.send({
          from: "Dream Tattoo Company <noreply@dreamtattoocompany.com>",
          to: [contact.email],
          subject: emailSubject,
          html: personalizedHtml,
        });

        if (sendError) {
          console.error(`Failed to send to ${contact.email}:`, sendError);
          failCount++;

          if (campaignId) {
            await supabase.from("email_campaign_recipients").insert({
              campaign_id: campaignId,
              contact_id: contact.id,
              email: contact.email,
              status: "failed",
              error_message: sendError.message,
            });
          }
        } else {
          console.log(`Sent to ${contact.email}`);
          successCount++;

          if (campaignId) {
            await supabase.from("email_campaign_recipients").insert({
              campaign_id: campaignId,
              contact_id: contact.id,
              email: contact.email,
              status: "sent",
              sent_at: new Date().toISOString(),
            });
          }
        }

        // Rate limiting: wait 100ms between emails
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`Error sending to ${contact.email}:`, err);
        failCount++;
      }
    }

    // Update campaign status
    if (campaignId) {
      await supabase
        .from("email_campaigns")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          total_sent: successCount,
          total_failed: failCount,
        })
        .eq("id", campaignId);
    }

    console.log(`Mass email complete. Sent: ${successCount}, Failed: ${failCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        totalContacts: contacts.length,
        sent: successCount,
        failed: failCount,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-mass-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
