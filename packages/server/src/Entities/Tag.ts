import { GenericEntity, Type } from "./Generic.js";

/**
 * TagType is an enum containing
 * recognized types in renderers
 * like vtt
 */

export enum TagType {
	SPAN /********/ = 0b00000000,
	VOICE /*******/ = 0b00000001,
	LANG /********/ = 0b00000010,
	RUBY /********/ = 0b00000100,
	RT /**********/ = 0b00001000,
	CLASS /*******/ = 0b00010000,
	BOLD /********/ = 0b00100000,
	ITALIC /******/ = 0b01000000,
	UNDERLINE /***/ = 0b10000000,
}

export class Tag extends GenericEntity {
	public tagType: TagType;
	public attributes: Map<string, string | undefined>;
	public classes: string[];
	public styles?: { [key: string]: string };

	public constructor(params: {
		offset: number;
		length: number;
		tagType: TagType;
		attributes: Map<string, string | undefined>;
		styles?: Tag["styles"];
		classes: Tag["classes"];
	}) {
		super(Type.TAG, params.offset, params.length);

		this.tagType = params.tagType;
		this.attributes = params.attributes;
		this.styles = params.styles || {};
		this.classes = params.classes || [];
	}

	setStyles(styles: string | Tag["styles"]) {
		let stylesObject: { [key: string]: string };

		if (typeof styles === "string") {
			stylesObject = {};

			const couples = styles.split(/\s*;\s*/);

			for (let couple of couples) {
				if (!couple.length) {
					continue;
				}

				const [key, value] = couple.split(/\s*:\s*/);
				stylesObject[key] = value;
			}
		}

		Object.assign(this.styles, stylesObject || styles);
	}
}
