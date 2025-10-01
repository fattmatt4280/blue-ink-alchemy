import { supabase } from "@/integrations/supabase/client";

interface AdminAction {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: any;
}

export const logAdminAction = async ({ 
  action, 
  resourceType, 
  resourceId, 
  details 
}: AdminAction) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot log admin action: No authenticated user');
      return;
    }

    await supabase.from('analytics_events').insert({
      event_type: 'admin_action',
      user_id: user.id,
      event_data: {
        action,
        resourceType,
        resourceId,
        details,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};
