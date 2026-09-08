import { BuilderSigner } from "./signer.js";
import { post } from "./http-helpers/index.js";
import {
    BuilderApiKeyCreds,
    BuilderHeaderPayload,
    BuilderType,
    RemoteBuilderConfig,
    RemoteSignerPayload,
} from "./types.js";
import { AxiosRequestHeaders } from "axios";

export class BuilderConfig {
    readonly remoteBuilderConfig?: RemoteBuilderConfig;
    readonly localBuilderCreds?: BuilderApiKeyCreds;
    readonly signer?: BuilderSigner;

    constructor(config?: {
        remoteBuilderConfig?: RemoteBuilderConfig;
        localBuilderCreds?: BuilderApiKeyCreds;
    }) {
        if (config) {
            if (config.remoteBuilderConfig !== undefined) {
                if (!BuilderConfig.hasValidRemoteUrl(config.remoteBuilderConfig.url)) {
                    throw new Error("invalid remote url!");
                }
                if (config.remoteBuilderConfig.token !== undefined) {
                    const tk = config.remoteBuilderConfig.token;
                    if (tk.length === 0) {
                        throw new Error("invalid auth token");
                    }
                }
                this.remoteBuilderConfig = config.remoteBuilderConfig;
            }
            if (config.localBuilderCreds !== undefined) {
                if (!BuilderConfig.hasValidLocalCreds(config.localBuilderCreds)) {
                    throw new Error("invalid local builder credentials!");
                }
                this.localBuilderCreds = config.localBuilderCreds;
                this.signer = new BuilderSigner(config.localBuilderCreds);
            }
        }
    }

    /**
     * Helper function to generate builder headers using the configured credential method.
     * Raw errors are deliberately caught and suppressed to avoid leaking sensitive bearer tokens.
     */
    public async generateBuilderHeaders(
        method: string,
        path: string,
        body?: string,
        timestamp?: number,
    ): Promise<BuilderHeaderPayload | undefined> {
        this.ensureValid();

        const builderType = this.getBuilderType();

        if (builderType === BuilderType.LOCAL) {
            return this.signer?.createBuilderHeaderPayload(method, path, body, timestamp);
        }

        if (builderType === BuilderType.REMOTE) {
            const remoteConfig = this.remoteBuilderConfig as RemoteBuilderConfig;
            const url: string = remoteConfig.url;

            const payload: RemoteSignerPayload = {
                method,
                path,
                body,
                timestamp,
            };

            try {
                const token = remoteConfig.token;
                const headers: AxiosRequestHeaders = {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                } as AxiosRequestHeaders;

                // Transmit payload and headers directly to the HTTP helper
                return await post<BuilderHeaderPayload>(url, payload, { headers });
            } catch {
                // Suppress raw Axios errors to prevent leaking authorization headers to logs
                return undefined;
            }
        }

        return undefined;
    }

    public isValid(): boolean {
        return this.getBuilderType() !== BuilderType.UNAVAILABLE;
    }

    public getBuilderType(): BuilderType {
        const local = this.localBuilderCreds;
        const remote = this.remoteBuilderConfig;
        if (local && remote) {
            // Local credentials take precedence when both are provided
            return BuilderType.LOCAL;
        }
        if (local) {
            return BuilderType.LOCAL;
        }
        if (remote) {
            return BuilderType.REMOTE;
        }
        return BuilderType.UNAVAILABLE;
    }

    private static hasValidLocalCreds(creds?: BuilderApiKeyCreds): boolean {
        if (!creds) return false;

        const { key, secret, passphrase } = creds;
        if (!key || !key.trim()) return false;
        if (!secret || !secret.trim()) return false;
        if (!passphrase || !passphrase.trim()) return false;

        return true;
    }

    /**
     * Enforces HTTPS protocol and forbids embedded user credentials (user:password@)
     */
    private static hasValidRemoteUrl(remoteUrl?: string): boolean {
        if (!remoteUrl || !remoteUrl.trim()) return false;
        try {
            const parsedUrl = new URL(remoteUrl);
            return (
                parsedUrl.protocol === "https:" &&
                parsedUrl.username === "" &&
                parsedUrl.password === ""
            );
        } catch {
            return false;
        }
    }

    private ensureValid(): void {
        if (this.getBuilderType() === BuilderType.UNAVAILABLE) {
            throw new Error("invalid builder creds configured!");
        }
    }
}