/**
 * Query Key Factory — Type-safe query key'ler
 *
 * Invalidation için:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() })
 *
 * Detail için:
 *   queryKey: queryKeys.orders.detail(id)
 */
export const queryKeys = {
  orders: {
    all:     ()              => ["orders"]                       as const,
    list:    (params: unknown) => ["orders", "list", params]    as const,
    detail:  (id: number)   => ["orders", "detail", id]         as const,
    summary: ()              => ["orders", "summary", "today"]  as const,
  },

  products: {
    all:    ()              => ["products"]                      as const,
    list:   (params: unknown) => ["products", "list", params]   as const,
    detail: (id: number)   => ["products", "detail", id]        as const,
  },

  inventory: {
    all:      ()            => ["inventory"]                     as const,
    lowStock: ()            => ["inventory", "low-stock"]        as const,
    report:   ()            => ["inventory", "report"]           as const,
  },

  shipments: {
    all:     ()             => ["shipments"]                     as const,
    list:    (params: unknown) => ["shipments", "list", params]  as const,
    delayed: ()             => ["shipments", "delayed"]          as const,
    detail:  (id: number)   => ["shipments", "detail", id]       as const,
  },

  chat: {
    history: (sessionId: string) => ["chat", "history", sessionId] as const,
  },

  auth: {
    me: ()                  => ["auth", "me"]                    as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
