import { buildHmacSignature } from "./signing";
import { BuilderApiKeyCreds, BuilderHeaderPayload } from "./types";


export class BuilderSigner {
    readonly creds: BuilderApiKeyCreds;

    constructor(creds: BuilderApiKeyCreds) {
        this.creds = creds;
    }

    public createBuilderHeaderPayload(
        body: string,
        path: string,
        method: string,
    ): BuilderHeaderPayload {
        const ts = Math.floor(Date.now() / 1000);
        const builderSig = buildHmacSignature(
            this.creds.secret,
            ts,
            method,
            path,
            body,
        );

        return {
            POLY_BUILDER_API_KEY: this.creds.key,
            POLY_BUILDER_PASSPHRASE: this.creds.passphrase,
            POLY_BUILDER_SIGNATURE: builderSig,
            POLY_BUILDER_TIMESTAMP: `${ts}`,
        }
    }
}
