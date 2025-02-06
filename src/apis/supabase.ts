import { createClient } from '@supabase/supabase-js'
import type { Group } from '../types/entities'
import { getEnv } from '../utils/get-env'

export const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_KEY'))

export const createGroup = async (group: Pick<Group, 'name' | 'id'>) => {
	const gData = await supabase.from('groups').insert(group)
	if (gData.error) throw gData.error

	const gvData = await supabase.rpc('create_group_view', { group_id: group.id })
	if (gvData.error) throw gvData.error

	const bvData = await supabase.rpc('create_bill_view', { group_id: group.id })
	if (bvData.error) throw bvData.error
}
