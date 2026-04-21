import { dataApi as localDataApi } from "./localDataClient";
import { supabaseDataApi } from "./supabaseDataClient";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export const base44 = isSupabaseConfigured ? supabaseDataApi : localDataApi;

export default base44;
