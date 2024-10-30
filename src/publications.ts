import bsb from "@openbible/bsb";

const publications = {
	bsb: { ...bsb, url: "https://bsb.openbible.io" },
};
console.log(publications)

export type Publication = typeof publications[keyof typeof publications];
export default publications;
