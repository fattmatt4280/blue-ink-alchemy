import { z } from 'zod';

export const businessInfoSchema = z.object({
  business_name: z.string().min(2, 'Business name is required'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  studio_location: z.string().min(2, 'Studio location is required'),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string().optional(),
});

export const professionalInfoSchema = z.object({
  specialties: z.array(z.string()).min(1, 'Select at least one specialty'),
  years_experience: z.number().min(0, 'Years of experience must be positive').max(50, 'Please enter a valid number'),
  accepting_clients: z.boolean().default(true),
});

export const notificationPrefsSchema = z.object({
  alerts: z.enum(['email', 'push', 'both', 'none']),
  chats: z.enum(['email', 'push', 'both', 'none']),
});

export type BusinessInfo = z.infer<typeof businessInfoSchema>;
export type ProfessionalInfo = z.infer<typeof professionalInfoSchema>;
export type NotificationPrefs = z.infer<typeof notificationPrefsSchema>;
