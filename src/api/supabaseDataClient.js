import { requireSupabase } from "@/lib/supabaseClient";

const ENTITY_CONFIG = {
  Appointment: { table: "appointments" },
  Budget: { table: "budgets" },
  Client: { table: "clients" },
  DailyService: { table: "daily_services" },
  Expense: { table: "expenses" },
  Package: { table: "packages" },
  Payment: { table: "payments" },
  Service: { table: "services" },
};

function castNumber(value) {
  if (value === null || value === undefined || value === "") {
    return value ?? null;
  }

  return Number(value);
}

function normalizeEntity(entityName, row) {
  if (!row) {
    return null;
  }

  const baseRow = {
    ...row,
    created_date: row.created_at ?? row.created_date ?? null,
    updated_date: row.updated_at ?? row.updated_date ?? null,
  };

  switch (entityName) {
    case "Service":
      return {
        ...baseRow,
        price: castNumber(row.price),
        duration_minutes: row.duration_minutes ?? null,
      };
    case "Package":
      return {
        ...baseRow,
        price: castNumber(row.price),
        services: row.service_ids ?? row.services ?? [],
      };
    case "Appointment":
      return {
        ...baseRow,
        amount: castNumber(row.amount),
      };
    case "Payment":
      return {
        ...baseRow,
        amount: castNumber(row.amount),
      };
    case "Expense":
      return {
        ...baseRow,
        amount: castNumber(row.amount),
      };
    case "DailyService":
      return {
        ...baseRow,
        price: castNumber(row.price),
      };
    case "Budget":
      return {
        ...baseRow,
        total: castNumber(row.total),
        items: Array.isArray(row.items) ? row.items : [],
      };
    default:
      return baseRow;
  }
}

function serializeEntity(entityName, payload) {
  if (!payload) {
    return payload;
  }

  const basePayload = {
    ...payload,
  };

  delete basePayload.created_date;
  delete basePayload.updated_date;

  if (Object.prototype.hasOwnProperty.call(basePayload, "created_at")) {
    delete basePayload.created_at;
  }
  if (Object.prototype.hasOwnProperty.call(basePayload, "updated_at")) {
    delete basePayload.updated_at;
  }

  switch (entityName) {
    case "Service":
      return {
        ...basePayload,
        price: castNumber(payload.price) ?? 0,
        duration_minutes: payload.duration_minutes ? Number(payload.duration_minutes) : null,
      };
    case "Package":
      return {
        ...basePayload,
        price: castNumber(payload.price) ?? 0,
        service_ids: payload.service_ids ?? payload.services ?? [],
      };
    case "Appointment":
      return {
        ...basePayload,
        amount: castNumber(payload.amount) ?? 0,
      };
    case "Payment":
      return {
        ...basePayload,
        amount: castNumber(payload.amount) ?? 0,
      };
    case "Expense":
      return {
        ...basePayload,
        amount: castNumber(payload.amount) ?? 0,
      };
    case "DailyService":
      return {
        ...basePayload,
        price: castNumber(payload.price) ?? 0,
      };
    case "Budget":
      return {
        ...basePayload,
        total: castNumber(payload.total) ?? 0,
        items: payload.items ?? [],
      };
    default:
      return basePayload;
  }
}

function parseOrder(order) {
  if (!order) {
    return null;
  }

  const descending = order.startsWith("-");
  const column = descending ? order.slice(1) : order;

  const remap = {
    created_date: "created_at",
    updated_date: "updated_at",
  };

  return {
    column: remap[column] ?? column,
    ascending: !descending,
  };
}

async function runQuery(builder) {
  const { data, error } = await builder;

  if (error) {
    throw error;
  }

  return data;
}

function createEntityApi(entityName) {
  const config = ENTITY_CONFIG[entityName];

  return {
    async list(order, limit) {
      const supabase = requireSupabase();
      let query = supabase.from(config.table).select("*");
      const parsedOrder = parseOrder(order);

      if (parsedOrder) {
        query = query.order(parsedOrder.column, { ascending: parsedOrder.ascending });
      }

      if (typeof limit === "number") {
        query = query.limit(limit);
      }

      const rows = await runQuery(query);
      return rows.map((row) => normalizeEntity(entityName, row));
    },

    async filter(criteria = {}, order) {
      const supabase = requireSupabase();
      let query = supabase.from(config.table).select("*");

      Object.entries(criteria).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const parsedOrder = parseOrder(order);
      if (parsedOrder) {
        query = query.order(parsedOrder.column, { ascending: parsedOrder.ascending });
      }

      const rows = await runQuery(query);
      return rows.map((row) => normalizeEntity(entityName, row));
    },

    async get(id) {
      const supabase = requireSupabase();
      const row = await runQuery(supabase.from(config.table).select("*").eq("id", id).maybeSingle());
      return normalizeEntity(entityName, row);
    },

    async create(payload) {
      const supabase = requireSupabase();
      const record = serializeEntity(entityName, payload);
      const row = await runQuery(supabase.from(config.table).insert(record).select("*").single());
      return normalizeEntity(entityName, row);
    },

    async update(id, patch) {
      const supabase = requireSupabase();
      const record = serializeEntity(entityName, patch);
      const row = await runQuery(supabase.from(config.table).update(record).eq("id", id).select("*").single());
      return normalizeEntity(entityName, row);
    },

    async delete(id) {
      const supabase = requireSupabase();
      await runQuery(supabase.from(config.table).delete().eq("id", id));
      return { success: true, id };
    },
  };
}

async function loadProfile(userId) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export const supabaseDataApi = {
  entities: {
    Appointment: createEntityApi("Appointment"),
    Budget: createEntityApi("Budget"),
    Client: createEntityApi("Client"),
    DailyService: createEntityApi("DailyService"),
    Expense: createEntityApi("Expense"),
    Package: createEntityApi("Package"),
    Payment: createEntityApi("Payment"),
    Service: createEntityApi("Service"),
  },
  auth: {
    async me() {
      const supabase = requireSupabase();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        return null;
      }

      const profile = await loadProfile(session.user.id).catch(() => null);

      return {
        id: session.user.id,
        email: session.user.email,
        name: profile?.full_name ?? session.user.user_metadata?.full_name ?? session.user.email,
        role: profile?.role ?? "staff",
        profile,
        session,
      };
    },

    async login(credentials = {}) {
      const supabase = requireSupabase();
      const { email, password } = credentials;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw error;
      }

      const profile = await loadProfile(data.user.id).catch(() => null);

      return {
        id: data.user.id,
        email: data.user.email,
        name: profile?.full_name ?? data.user.user_metadata?.full_name ?? data.user.email,
        role: profile?.role ?? "staff",
        profile,
        session: data.session,
      };
    },

    async logout() {
      const supabase = requireSupabase();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }
    },

    async redirectToLogin() {
      return null;
    },
  },
};

export default supabaseDataApi;
