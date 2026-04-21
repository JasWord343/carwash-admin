const STORAGE_KEY = "carwash-local-db";
const SESSION_KEY = "carwash-local-session";

const ENTITY_NAMES = [
  "Appointment",
  "Budget",
  "Client",
  "DailyService",
  "Expense",
  "Package",
  "Payment",
  "Service",
];

const defaultUser = {
  id: "demo-admin",
  name: "Administrador",
  email: "admin@carwash.local",
  role: "admin",
};

function hasWindow() {
  return typeof window !== "undefined";
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function formatDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function createSeedData() {
  const services = [
    {
      id: "service-basic",
      name: "Lavado Basico",
      description: "Lavado exterior y aspirado rapido.",
      price: 12,
      duration_minutes: 30,
      active: true,
      created_date: nowIso(),
      updated_date: nowIso(),
    },
    {
      id: "service-premium",
      name: "Lavado Premium",
      description: "Exterior, interior y encerado rapido.",
      price: 25,
      duration_minutes: 60,
      active: true,
      created_date: nowIso(),
      updated_date: nowIso(),
    },
    {
      id: "service-engine",
      name: "Lavado de Motor",
      description: "Limpieza detallada del motor.",
      price: 35,
      duration_minutes: 50,
      active: true,
      created_date: nowIso(),
      updated_date: nowIso(),
    },
  ];

  const packages = [
    {
      id: "package-full",
      name: "Paquete Full",
      description: "Lavado premium mas lavado de motor.",
      price: 55,
      services: ["service-premium", "service-engine"],
      active: true,
      created_date: nowIso(),
      updated_date: nowIso(),
    },
  ];

  const clients = [
    {
      id: "client-ana",
      name: "Ana Lopez",
      phone: "809-555-1010",
      email: "ana@example.com",
      vehicle_brand: "Toyota",
      vehicle_model: "Corolla",
      vehicle_year: "2021",
      vehicle_color: "Blanco",
      vehicle_plates: "A123456",
      notes: "Prefiere contacto por WhatsApp.",
      created_date: nowIso(),
      updated_date: nowIso(),
    },
    {
      id: "client-carlos",
      name: "Carlos Perez",
      phone: "809-555-2020",
      email: "",
      vehicle_brand: "Honda",
      vehicle_model: "CR-V",
      vehicle_year: "2020",
      vehicle_color: "Gris",
      vehicle_plates: "B654321",
      notes: "",
      created_date: nowIso(),
      updated_date: nowIso(),
    },
  ];

  return {
    Service: services,
    Package: packages,
    Client: clients,
    Appointment: [
      {
        id: "appointment-1",
        client_id: "client-ana",
        client_name: "Ana Lopez",
        service_type: "service",
        service_id: "service-premium",
        service_name: "Lavado Premium",
        amount: 25,
        date: formatDate(0),
        time: "09:30",
        notes: "Cliente llega temprano.",
        status: "scheduled",
        created_date: nowIso(),
        updated_date: nowIso(),
      },
      {
        id: "appointment-2",
        client_id: "client-carlos",
        client_name: "Carlos Perez",
        service_type: "package",
        service_id: "package-full",
        service_name: "Paquete Full",
        amount: 55,
        date: formatDate(1),
        time: "14:00",
        notes: "",
        status: "scheduled",
        created_date: nowIso(),
        updated_date: nowIso(),
      },
    ],
    Payment: [
      {
        id: "payment-1",
        client_id: "client-ana",
        client_name: "Ana Lopez",
        amount: 25,
        method: "card",
        concept: "Lavado Premium",
        notes: "",
        date: formatDate(0),
        created_date: nowIso(),
        updated_date: nowIso(),
      },
      {
        id: "payment-2",
        client_id: "client-carlos",
        client_name: "Carlos Perez",
        amount: 12,
        method: "cash",
        concept: "Lavado Basico",
        notes: "",
        date: formatDate(-1),
        created_date: nowIso(),
        updated_date: nowIso(),
      },
    ],
    Expense: [
      {
        id: "expense-1",
        concept: "Shampoo para autos",
        amount: 18,
        category: "supplies",
        notes: "",
        date: formatDate(0),
        created_date: nowIso(),
        updated_date: nowIso(),
      },
      {
        id: "expense-2",
        concept: "Pago de luz",
        amount: 40,
        category: "utilities",
        notes: "",
        date: formatDate(-2),
        created_date: nowIso(),
        updated_date: nowIso(),
      },
    ],
    DailyService: [
      {
        id: "daily-1",
        date: formatDate(0),
        client_id: "client-carlos",
        client_name: "Carlos Perez",
        service_id: "service-basic",
        service_name: "Lavado Basico",
        price: 12,
        payment_method: "cash",
        status: "completed",
        vehicle_info: "Honda CR-V gris B654321",
        notes: "",
        created_date: nowIso(),
        updated_date: nowIso(),
      },
      {
        id: "daily-2",
        date: formatDate(0),
        client_id: "client-ana",
        client_name: "Ana Lopez",
        service_id: "service-premium",
        service_name: "Lavado Premium",
        price: 25,
        payment_method: "transfer",
        status: "pending",
        vehicle_info: "Toyota Corolla blanco A123456",
        notes: "Esperar confirmacion de pago.",
        created_date: nowIso(),
        updated_date: nowIso(),
      },
    ],
    Budget: [
      {
        id: "budget-1",
        client_id: "client-ana",
        client_name: "Ana Lopez",
        items: [
          { name: "Lavado Premium", price: 25, quantity: 1 },
          { name: "Aromatizante", price: 5, quantity: 1 },
        ],
        total: 30,
        valid_until: formatDate(7),
        notes: "Incluye entrega el mismo dia.",
        status: "draft",
        created_date: nowIso(),
        updated_date: nowIso(),
      },
    ],
  };
}

function loadDb() {
  if (!hasWindow()) {
    return createSeedData();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = createSeedData();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  const parsed = JSON.parse(raw);
  const normalized = ENTITY_NAMES.reduce((acc, entityName) => {
    acc[entityName] = Array.isArray(parsed[entityName]) ? parsed[entityName] : [];
    return acc;
  }, {});

  return normalized;
}

function saveDb(db) {
  if (hasWindow()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
}

function ensureSession() {
  if (!hasWindow()) {
    return defaultUser;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  }

  return JSON.parse(raw);
}

function saveSession(user) {
  if (!hasWindow()) {
    return;
  }

  if (user) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

function makeId(entityName) {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `${entityName.toLowerCase()}-${suffix}`;
}

function normalizeValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return value;
}

function sortRows(rows, order) {
  if (!order) {
    return [...rows];
  }

  const descending = order.startsWith("-");
  const key = descending ? order.slice(1) : order;

  return [...rows].sort((left, right) => {
    const leftValue = normalizeValue(left[key]);
    const rightValue = normalizeValue(right[key]);

    if (leftValue < rightValue) {
      return descending ? 1 : -1;
    }

    if (leftValue > rightValue) {
      return descending ? -1 : 1;
    }

    return 0;
  });
}

function matchesCriteria(row, criteria = {}) {
  return Object.entries(criteria).every(([key, value]) => row[key] === value);
}

function createEntityApi(entityName) {
  return {
    async list(order, limit) {
      const db = loadDb();
      const rows = sortRows(db[entityName], order);
      return clone(typeof limit === "number" ? rows.slice(0, limit) : rows);
    },
    async filter(criteria = {}, order) {
      const db = loadDb();
      const rows = db[entityName].filter((row) => matchesCriteria(row, criteria));
      return clone(sortRows(rows, order));
    },
    async get(id) {
      const db = loadDb();
      return clone(db[entityName].find((row) => row.id === id) ?? null);
    },
    async create(payload) {
      const db = loadDb();
      const record = {
        ...payload,
        id: payload.id ?? makeId(entityName),
        created_date: payload.created_date ?? nowIso(),
        updated_date: nowIso(),
      };
      db[entityName] = [record, ...db[entityName]];
      saveDb(db);
      return clone(record);
    },
    async update(id, patch) {
      const db = loadDb();
      let updatedRecord = null;

      db[entityName] = db[entityName].map((row) => {
        if (row.id !== id) {
          return row;
        }

        updatedRecord = {
          ...row,
          ...patch,
          id: row.id,
          created_date: row.created_date,
          updated_date: nowIso(),
        };

        return updatedRecord;
      });

      saveDb(db);
      return clone(updatedRecord);
    },
    async delete(id) {
      const db = loadDb();
      db[entityName] = db[entityName].filter((row) => row.id !== id);
      saveDb(db);
      return { success: true, id };
    },
  };
}

export const dataApi = {
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
      return clone(ensureSession());
    },
    async login(user = defaultUser) {
      saveSession(user);
      return clone(user);
    },
    logout(redirectUrl) {
      saveSession(null);
      if (redirectUrl && hasWindow()) {
        window.location.href = redirectUrl;
      }
    },
    redirectToLogin(redirectUrl) {
      saveSession(defaultUser);
      if (redirectUrl && hasWindow()) {
        window.location.href = redirectUrl;
      }
    },
  },
  reset() {
    const fresh = createSeedData();
    saveDb(fresh);
    saveSession(defaultUser);
    return clone(fresh);
  },
};

export default dataApi;
