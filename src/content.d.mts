import type { z } from 'astro/zod';

export declare const lectureSchema: z.ZodObject<{
  title: z.ZodString;
  subtitle: z.ZodOptional<z.ZodString>;
  number: z.ZodOptional<z.ZodNumber>;
  date: z.ZodOptional<z.ZodDate>;
  description: z.ZodOptional<z.ZodString>;
  unit: z.ZodOptional<z.ZodString>;
  draft: z.ZodDefault<z.ZodBoolean>;
  theme: z.ZodDefault<z.ZodEnum<['light', 'dark']>>;
  aspect: z.ZodDefault<z.ZodEnum<['16:9', '4:3']>>;
}>;

export declare const lectures: import('astro:content').CollectionConfig<typeof lectureSchema>;
