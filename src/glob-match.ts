const GLOBSTAR = "**";

export function matchGlob(pattern: string, path: string): boolean {
    const normalizedPattern = pattern.replace(/\\/g, "/");
    const normalizedPath = path.replace(/\\/g, "/");

    if (!normalizedPattern.includes("*") && !normalizedPattern.includes("?")) {
        return normalizedPath === normalizedPattern
            || normalizedPath.startsWith(normalizedPattern + "/")
            || normalizedPath.startsWith(normalizedPattern);
    }

    return segmentMatch(
        normalizedPattern.split("/"),
        normalizedPath.split("/"),
    );
}

function segmentMatch(patternSegs: string[], pathSegs: string[]): boolean {
    let pi = 0;
    let si = 0;
    let starPi = -1;
    let starSi = -1;

    while (si < pathSegs.length) {
        if (pi < patternSegs.length && patternSegs[pi] === GLOBSTAR) {
            starPi = pi;
            starSi = si;
            pi++;
        } else if (pi < patternSegs.length && matchSegment(patternSegs[pi], pathSegs[si])) {
            pi++;
            si++;
        } else if (starPi >= 0) {
            pi = starPi + 1;
            starSi++;
            si = starSi;
        } else {
            return false;
        }
    }

    while (pi < patternSegs.length && patternSegs[pi] === GLOBSTAR) {
        pi++;
    }

    return pi === patternSegs.length;
}

function matchSegment(pattern: string, value: string): boolean {
    if (pattern === "*") return true;

    let pi = 0;
    let vi = 0;
    let starPi = -1;
    let starVi = -1;

    while (vi < value.length) {
        if (pi < pattern.length && (pattern[pi] === "?" || pattern[pi] === value[vi])) {
            pi++;
            vi++;
        } else if (pi < pattern.length && pattern[pi] === "*") {
            starPi = pi;
            starVi = vi;
            pi++;
        } else if (starPi >= 0) {
            pi = starPi + 1;
            starVi++;
            vi = starVi;
        } else {
            return false;
        }
    }

    while (pi < pattern.length && pattern[pi] === "*") {
        pi++;
    }

    return pi === pattern.length;
}
