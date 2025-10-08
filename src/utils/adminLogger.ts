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

    // Map action to action_type
    const actionTypeMap: Record<string, string> = {
      'created': 'create',
      'updated': 'update',
      'deleted': 'delete',
      'exported': 'export',
      'generated': 'generate',
    };

    const actionType = actionTypeMap[action] || 'update';

    // Log to both analytics_events (existing) and admin_audit_log (new)
    await Promise.all([
      supabase.from('analytics_events').insert({
        event_type: 'admin_action',
        user_id: user.id,
        event_data: {
          action,
          resourceType,
          resourceId,
          details,
          timestamp: new Date().toISOString()
        }
      }),
      supabase.from('admin_audit_log').insert({
        admin_user_id: user.id,
        action_type: actionType,
        resource_type: resourceType,
        resource_id: resourceId,
        action_details: details || {},
        ip_address: 'client', // Will be enhanced with actual IP in future
        user_agent: navigator.userAgent,
      })
    ]);
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};
