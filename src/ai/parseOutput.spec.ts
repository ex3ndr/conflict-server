import { trimIndent } from "../utils/text";
import { parseOutput } from "./parseOutput";

describe('parseOutput', () => {
    it('should parse output', () => {
        let parsed = parseOutput(trimIndent(`
        #PUBLIC
        pppp
        #SECRET_A
        #SECRET_B
        #END
        `));
        expect(parsed).toMatchSnapshot();

        parsed = parseOutput(trimIndent(`
        #PUBLIC
        #SECRET_A
        A
        #SECRET_B
        #END
        `));
        expect(parsed).toMatchSnapshot();

        parsed = parseOutput(trimIndent(`
        #PUBLIC
        #SECRET_A
        A
        #SECRET_B
        B
        #END
        `));
        expect(parsed).toMatchSnapshot();

        parsed = parseOutput(trimIndent(`
        #PUBLIC
        #SECRET_A
        #SECRET_B
        B
        #END
        `));
        expect(parsed).toMatchSnapshot();
    });
});