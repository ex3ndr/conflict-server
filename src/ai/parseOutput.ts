import { trimIndent } from "../utils/text";

export function parseOutput(src: string) {

    src = trimIndent(src);

    // Remove tail and head
    if (src.startsWith('#PUBLIC')) {
        src = trimIndent(src.substring('#PUBLIC'.length));
    }
    if (src.endsWith('#END')) {
        src = trimIndent(src.substring(0, src.length - '\n#END'.length));
    }

    let publicMessage: string | null = null;
    let secretA: string | null = null;
    let secretB: string | null = null;

    // Extract public message
    let n = src.indexOf('#SECRET_A');
    if (n > -1) {
        let tt = trimIndent(src.substring(0, n));
        if (tt.length > 0) {
            publicMessage = tt;
        }
        src = trimIndent(src.substring(n + '#SECRET_A'.length));
    } else {
        if (src.length > 0) {
            publicMessage = src;
        }
        src = '';
    }

    // Extract secret message
    n = src.indexOf('#SECRET_B');
    if (n > -1) {
        let tt = trimIndent(src.substring(0, n));
        if (tt.length > 0) {
            secretA = tt;
        }
        src = trimIndent(src.substring(n + '#SECRET_B'.length));
    } else {
        if (src.length > 0) {
            secretA = src;
        }
        src = '';
    }
    if (src.length > 0) {
        secretB = src;
    }

    return {
        publicMessage,
        secretA,
        secretB
    };
}