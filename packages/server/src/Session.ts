import { HSBaseRendererConstructor } from "./BaseRenderer";
import type { RawTrack } from "./model";
import { TimelineTree } from "./TimelineTree.js";

const activeTrackSymbol = Symbol("session.active");

export class HSSession {
	private timelines: { [lang: string]: TimelineTree } = Object.create(null);
	private [activeTrackSymbol]: string = null;

	constructor(rawContents: RawTrack[], public renderer: InstanceType<HSBaseRendererConstructor>) {
		for (let { lang, content } of rawContents) {
			try {
				const entities = renderer.parse(content);

				if (entities.length) {
					this.timelines[lang] = new TimelineTree();

					for (let entity of entities) {
						this.timelines[lang].addNode(entity);
					}
				}
			} catch (err) {
				console.error(err);
			}
		}

		if (Object.keys(this.timelines).length) {
			this.activeTrack = Object.keys(this.timelines)[0];
		}
	}

	public get activeTrack() {
		return this[activeTrackSymbol];
	}

	public set activeTrack(lang: string) {
		if (!this.timelines[lang]) {
			console.warn("Missing language. Active track wasn't set.");
			return;
		}

		this[activeTrackSymbol] = lang;
	}
}
