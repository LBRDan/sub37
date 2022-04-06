export interface RawTrack {
	lang: string;
	content: unknown;
}

export interface Entity {
	/** zero-based shift based on cue begin, from which the entity will begin */
	offset: number;
	/** one-based content length in entity */
	length: number;
	attributes?: any[];
	type: number;
}

export interface CueNode {
	startTime: number;
	endTime: number;
	id?: string;
	styles?: any /** @TODO parse them */;
	entities?: Entity[];
	content: string;
}
