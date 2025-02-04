import { createClient } from '@supabase/supabase-js'
import { getEnv } from '../utils/get-env'

export const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_KEY'))
