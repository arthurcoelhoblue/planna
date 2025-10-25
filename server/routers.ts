import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Planna routers
  ingredients: router({
    parse: publicProcedure
      .input(z.object({ text: z.string() }))
      .mutation(async ({ input }) => {
        const { parseIngredients } = await import("./ingredients-dictionary");
        return parseIngredients(input.text);
      }),
    suggestions: publicProcedure
      .input(z.object({ partial: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        const { getSuggestions } = await import("./ingredients-dictionary");
        return getSuggestions(input.partial, input.limit);
      }),
    detectFromImage: protectedProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          location: z.enum(["geladeira", "congelador", "armario"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { detectIngredientsFromImage } = await import("./image-detection");
        const ingredients = await detectIngredientsFromImage({
          imageUrl: input.imageUrl,
          location: input.location,
        });
        return { ingredients };
      }),
    detectFromMultipleImages: protectedProcedure
      .input(
        z.object({
          images: z.array(
            z.object({
              url: z.string().url(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const { detectIngredientsFromMultipleImages } = await import("./image-detection");
        const ingredients = await detectIngredientsFromMultipleImages(input.images);
        return { ingredients };
      }),
  }),

  mealPlan: router({
    generate: protectedProcedure
      .input(
        z.object({
          ingredients: z.string(),
          servings: z.number().min(1).max(20),
          exclusions: z.array(z.string()).optional(),
          objective: z.enum(["praticidade", "economia", "normal", "aproveitamento", "desperdicio", "custo"]).optional(),
          varieties: z.number().min(1).max(6).optional(),
          allowNewIngredients: z.boolean().optional(),
          sophistication: z.enum(["simples", "gourmet"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { parseIngredients } = await import("./ingredients-dictionary");
        const { generateMealPlan } = await import("./recipe-engine");
        const {
          createSession,
          createPlan,
          getUserPreference,
          getUserDishFeedback,
        } = await import("./db");

        // Parse ingredients
        const parsedIngredients = parseIngredients(input.ingredients);
        const availableIngredients = parsedIngredients
          .filter(i => i.canonical)
          .map(i => i.canonical!);

        // Get user preferences and feedback
        const userPref = await getUserPreference(ctx.user.id);
        const feedback = await getUserDishFeedback(ctx.user.id);

        const userFavorites = userPref?.favorites ? JSON.parse(userPref.favorites) : [];
        const userDislikes = feedback
          .filter(f => f.rating === "disliked")
          .map(f => f.dishName);

        // Combine exclusions
        const allExclusions = [
          ...(input.exclusions || []),
          ...(userPref?.exclusions ? JSON.parse(userPref.exclusions) : []),
        ];

        // Generate plan
        const plan = await generateMealPlan({
          availableIngredients,
          servings: input.servings,
          exclusions: allExclusions,
          objective: input.objective,
          varieties: input.varieties,
          allowNewIngredients: input.allowNewIngredients,
          sophistication: input.sophistication,
          skillLevel: userPref?.skillLevel || "intermediate",
          userFavorites,
          userDislikes,
        });

        // Save session
        const sessionId = await createSession({
          userId: ctx.user.id,
          inputText: input.ingredients,
          servings: input.servings,
          objective: input.objective || "praticidade",
          exclusions: JSON.stringify(input.exclusions || []),
        });

        // Save plan
        const planId = await createPlan({
          sessionId,
          dishes: JSON.stringify(plan.dishes),
          shoppingList: JSON.stringify(plan.shoppingList),
          prepSchedule: JSON.stringify(plan.prepSchedule),
        });

        return {
          planId,
          sessionId,
          plan,
        };
      }),

    getById: protectedProcedure
      .input(z.object({ planId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getPlanById } = await import("./db");
        const plan = await getPlanById(input.planId);
        if (!plan) return null;

        return {
          ...plan,
          dishes: JSON.parse(plan.dishes),
          shoppingList: JSON.parse(plan.shoppingList),
          prepSchedule: JSON.parse(plan.prepSchedule),
        };
      }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
      const { getUserSessions } = await import("./db");
      return getUserSessions(ctx.user.id);
    }),

    delete: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteSession } = await import("./db");
        await deleteSession(input.sessionId, ctx.user.id);
        return { success: true };
      }),

    exportPDF: protectedProcedure
      .input(z.object({ planId: z.number() }))
      .mutation(async ({ input }) => {
        const { getPlanById } = await import("./db");
        const { generatePlanHTML } = await import("./pdf-exporter");
        
        const plan = await getPlanById(input.planId);
        if (!plan) {
          throw new Error("Plano não encontrado");
        }

        const mealPlan = {
          dishes: JSON.parse(plan.dishes),
          shoppingList: JSON.parse(plan.shoppingList),
          prepSchedule: JSON.parse(plan.prepSchedule),
          estimatedCost: "médio" as const,
          totalPrepTime: 90,
        };

        const html = generatePlanHTML(mealPlan);
        return { html };
      }),

    getWhatsAppText: protectedProcedure
      .input(z.object({ planId: z.number() }))
      .query(async ({ input }) => {
        const { getPlanById } = await import("./db");
        
        const plan = await getPlanById(input.planId);
        if (!plan) {
          throw new Error("Plano não encontrado");
        }

        const dishes = JSON.parse(plan.dishes);
        const shoppingList = JSON.parse(plan.shoppingList);

        let text = "🍱 *MEU PLANO SEMANAL DE MARMITAS*\n";
        text += `Gerado por Planna em ${new Date(plan.createdAt).toLocaleDateString("pt-BR")}\n\n`;

        text += "📋 *CARDÁPIO:*\n";
        dishes.forEach((dish: any, i: number) => {
          text += `${i + 1}. ${dish.name} (${dish.servings} porções)\n`;
        });

        text += "\n🛒 *LISTA DE COMPRAS:*\n";
        const grouped = shoppingList.reduce((acc: any, item: any) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        }, {});

        Object.entries(grouped).forEach(([category, items]: [string, any]) => {
          text += `\n*${category}:*\n`;
          items.forEach((item: any) => {
            text += `☐ ${item.item} - ${item.quantity} ${item.unit}\n`;
          });
        });

        return { text };
      }),
  }),

  feedback: router({
    submit: protectedProcedure
      .input(
        z.object({
          planId: z.number(),
          dishName: z.string(),
          rating: z.enum(["liked", "disliked"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { createDishFeedback } = await import("./db");
        await createDishFeedback({
          userId: ctx.user.id,
          planId: input.planId,
          dishName: input.dishName,
          rating: input.rating,
        });
        return { success: true };
      }),
  }),

  preferences: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const { getUserPreference } = await import("./db");
      const pref = await getUserPreference(ctx.user.id);
      if (!pref) return null;
      return {
        ...pref,
        exclusions: pref.exclusions ? JSON.parse(pref.exclusions) : [],
        favorites: pref.favorites ? JSON.parse(pref.favorites) : [],
      };
    }),

    update: protectedProcedure
      .input(
        z.object({
          exclusions: z.array(z.string()).optional(),
          favorites: z.array(z.string()).optional(),
          skillLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { getUserPreference, createUserPreference, updateUserPreference } = await import("./db");
        const existing = await getUserPreference(ctx.user.id);

        const updates: any = {};
        if (input.exclusions !== undefined) {
          updates.exclusions = JSON.stringify(input.exclusions);
        }
        if (input.favorites !== undefined) {
          updates.favorites = JSON.stringify(input.favorites);
        }
        if (input.skillLevel !== undefined) {
          updates.skillLevel = input.skillLevel;
        }

        if (!existing) {
          await createUserPreference({
            userId: ctx.user.id,
            ...updates,
          });
        } else {
          await updateUserPreference(ctx.user.id, updates);
        }

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
