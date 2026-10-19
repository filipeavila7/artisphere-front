interface RouteLocationParts {
    pathname: string;
    search: string;
    hash: string;
}

export function getCurrentRoute(location: RouteLocationParts): string {
    return `${location.pathname}${location.search}${location.hash}`;
}

export function withRouteOrigin(
    state: unknown,
    from: string,
    additionalState: Record<string, unknown> = {}
): Record<string, unknown> {
    const existingState = state !== null && typeof state === "object" && !Array.isArray(state)
        ? state as Record<string, unknown>
        : state === null || state === undefined
            ? {}
            : { stateValue: state };

    const stateToRestore = { ...existingState, ...additionalState };

    return {
        ...stateToRestore,
        routeOrigin: from,
        routeOriginState: state === null || state === undefined
            ? null
            : stateToRestore,
    };
}

export function withRouteOriginIfMissing(
    state: unknown,
    fallbackFrom: string
): unknown {
    if (getRouteOrigin(state, "")) {
        return state;
    }

    return withRouteOrigin(state, fallbackFrom);
}

export function getRouteOrigin(
    state: unknown,
    fallback: string,
    currentRoute?: string
): string {
    if (state === null || typeof state !== "object") {
        return fallback;
    }

    const from = (state as Record<string, unknown>).routeOrigin;
    if (
        typeof from !== "string" ||
        !from.startsWith("/") ||
        from.startsWith("//") ||
        from.includes("\\") ||
        (currentRoute !== undefined && from.split("#")[0] === currentRoute.split("#")[0])
    ) {
        return fallback;
    }

    return from;
}

export function getRouteOriginState(state: unknown): unknown {
    if (!getRouteOrigin(state, "") || state === null || typeof state !== "object") {
        return undefined;
    }

    return (state as Record<string, unknown>).routeOriginState;
}
