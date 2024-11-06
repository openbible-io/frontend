import bsb from "@openbible/bsb";

const publications = {
	bsb: { ...bsb, url: "https://bsb.openbible.io" },
};

export type Publication = typeof publications[keyof typeof publications];
export default publications;
