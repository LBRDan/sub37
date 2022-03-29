import { CueNode } from "@hsubs/server";
import { Tokenizer } from "../Tokenizer.js";
import { TokenType } from "../Token.js";
import type { Token } from "../Token.js";
import * as Tags from "./Tags";
import * as Timestamps from "./Timestamps.utils.js";

export interface CueData {
	cueid: string;
	starttime: string;
	endtime: string;
	attributes: any;
	text: string;
}

export function parseCue(data: CueData): CueNode[] {
	const { starttime, endtime, text } = data;

	const hsCues: CueNode[] = [];
	const tokenizer = new Tokenizer(text);
	let token: Token = null;
	let currentCue = createCue(
		Timestamps.parseMs(starttime),
		Timestamps.parseMs(endtime),
		data.cueid,
	);

	const openTagsTree = new Tags.NodeTree();

	while ((token = tokenizer.nextToken())) {
		switch (token.type) {
			case TokenType.START_TAG: {
				if (Tags.isSupported(token.content)) {
					openTagsTree.push(new Tags.Node(currentCue.content.length, token));
				}

				break;
			}

			case TokenType.END_TAG: {
				if (Tags.isSupported(token.content) && openTagsTree.length) {
					if (!openTagsTree.current) {
						break;
					}

					/**
					 * <ruby> is expected to contain nothing but text and <rt>.
					 * Can we be safe about popping twice, one for rt and one for ruby later?
					 */

					if (token.content === "ruby" && openTagsTree.current.token.content === "rt") {
						const out = openTagsTree.pop();
						currentCue.entities.push(Tags.createEntity(currentCue, out));
					}

					if (openTagsTree.current.token.content === token.content) {
						const out = openTagsTree.pop();
						currentCue.entities.push(Tags.createEntity(currentCue, out));
					}
				}

				break;
			}

			case TokenType.STRING: {
				currentCue.content += token.content;
				break;
			}

			case TokenType.TIMESTAMP: {
				if (!currentCue.content.length) {
					/** Current cue is the first one. Not need to append a new one */
					break;
				}

				/**
				 * Closing the current entities for the previous cue,
				 * still without resetting open tags, because timestamps
				 * actually belong to the same "logic" cue, so we might
				 * have some tags still open
				 */

				currentCue.entities.push(...Tags.createEntitiesFromUnpaired(openTagsTree, currentCue));
				hsCues.push(currentCue);

				currentCue = createCue(
					Timestamps.parseMs(token.content),
					currentCue.endTime,
					currentCue.id,
				);

				break;
			}

			default:
				break;
		}

		// Resetting the token for the next one
		token = null;
	}

	/**
	 * For the last token... hip hip, hooray!
	 * Jk, we need to close the yet-opened
	 * tags and create entities for them.
	 */

	currentCue.entities.push(...Tags.createEntitiesFromUnpaired(openTagsTree, currentCue));

	if (currentCue.content.length) {
		hsCues.push(currentCue);
	}

	return hsCues;
}

function createCue(startTime: number, endTime: number, id?: string): CueNode {
	return {
		startTime,
		endTime,
		content: "",
		entities: [],
		id,
	};
}
