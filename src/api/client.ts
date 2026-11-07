export type QueryParamValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | readonly (string | number | boolean)[];

export type QueryParamsRecord = Record<string, QueryParamValue>;

export interface RequestOptions extends Omit<RequestInit, "body"> {
    params?: QueryParamsRecord;
    body?: unknown;
}

export class ApiError extends Error {
    public readonly status: number;
    public readonly detail: unknown;
    public readonly saved?: boolean;

    constructor(message: string, status: number, detail?: unknown, saved?: boolean) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.detail = detail;
        this.saved = saved;
    }
}

function extractErrorMessage(payload: unknown, fallbackStatus: number): string {
    if (payload && typeof payload === "object" && "detail" in payload) {
        const detail = (payload as { detail: unknown }).detail;
        if (typeof detail === "string" && detail.trim().length > 0) {
            return detail;
        }
        if (Array.isArray(detail) && detail.length > 0) {
            return detail
                .map((item) => {
                    if (typeof item === "string") return item;
                    if (item && typeof item === "object" && "msg" in item) {
                        return String((item as { msg: unknown }).msg);
                    }
                    return JSON.stringify(item);
                })
                .join("; ");
        }
        if (detail && typeof detail === "object") {
            return JSON.stringify(detail);
        }
    }
    return `API request failed with status ${fallbackStatus}.`;
}

export class BaseApiClient {
    protected readonly baseUrl: string;

    constructor(baseUrl = "") {
        this.baseUrl = baseUrl.replace(/\/$/, "");
    }

    protected buildUrl(path: string, params?: QueryParamsRecord): string {
        const normalizedPath = path.startsWith("/") ? path : `/${path}`;
        const fullPath = `${this.baseUrl}${normalizedPath}`;

        if (!params) {
            return fullPath;
        }

        const searchParams = new URLSearchParams();
        for (const [key, rawValue] of Object.entries(params)) {
            if (rawValue === undefined || rawValue === null) {
                continue;
            }
            if (Array.isArray(rawValue)) {
                for (const item of rawValue) {
                    searchParams.append(key, String(item));
                }
            } else {
                searchParams.set(key, String(rawValue));
            }
        }

        const queryString = searchParams.toString();
        if (!queryString) {
            return fullPath;
        }
        return `${fullPath}?${queryString}`;
    }

    protected async parseError(response: Response): Promise<ApiError> {
        let payload: unknown = null;
        try {
            payload = await response.json();
        } catch {
            // Response body was not JSON
        }

        const message = extractErrorMessage(payload, response.status);
        const saved =
            payload &&
            typeof payload === "object" &&
            "saved" in payload &&
            typeof (payload as { saved: unknown }).saved === "boolean"
                ? (payload as { saved: boolean }).saved
                : undefined;

        return new ApiError(message, response.status, payload, saved);
    }

    protected async request<T>(
        path: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const { params, body, headers, ...restInit } = options;
        const url = this.buildUrl(path, params);

        const requestHeaders = new Headers(headers);
        if (body !== undefined && !requestHeaders.has("Content-Type")) {
            requestHeaders.set("Content-Type", "application/json");
        }

        const response = await fetch(url, {
            ...restInit,
            headers: requestHeaders,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            throw await this.parseError(response);
        }

        if (response.status === 204) {
            return undefined as T;
        }

        return (await response.json()) as T;
    }

    protected async requestNdjsonStream<TEvent>(
        path: string,
        options: RequestOptions,
        onEvent: (event: TEvent) => void
    ): Promise<void> {
        const { params, body, headers, ...restInit } = options;
        const url = this.buildUrl(path, params);

        const requestHeaders = new Headers(headers);
        if (body !== undefined && !requestHeaders.has("Content-Type")) {
            requestHeaders.set("Content-Type", "application/json");
        }

        const response = await fetch(url, {
            ...restInit,
            headers: requestHeaders,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            throw await this.parseError(response);
        }

        if (!response.body) {
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    break;
                }
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) continue;
                    const parsed = JSON.parse(trimmed) as TEvent;
                    onEvent(parsed);
                }
            }

            const remaining = buffer.trim();
            if (remaining) {
                const parsed = JSON.parse(remaining) as TEvent;
                onEvent(parsed);
            }
        } finally {
            reader.releaseLock();
        }
    }
}
