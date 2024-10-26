// These don't have to be the latest version.
// They'll be used to initialize the offline cache.
import bsb from "@openbible/bsb";

export default {
	bsb: { ...bsb, url: "https://bsb.openbible.io" },
};
