export type Member = {
	id: string
	name: string
	avatar?: string
}

export type Group = {
	id: string
	name: string
	createdAt: string
	members: Member[]
}
