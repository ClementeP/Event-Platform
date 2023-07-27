import expect from 'expect';
import { IRules, rule } from 'graphql-shield';
import { RuleOr } from 'graphql-shield/dist/rules';
import { OR } from '../rb_permissions/inheritance';

const P = rule()(() => true);
const Q = rule()(() => true);

const RulesA: IRules = {
    Record: { _id: P },
    Query: { q: P },
};
const RulesB: IRules = {
    Query: { q: Q },
    Mutation: { m: P },
};
const RulesC: IRules = {
    OtherRecord: { _id: P },
    Record: { _id: Q },
    Mutation: { m: Q },
};

describe('RBAC', () => {
    it('should merge leafs', () => {
        const newRules = OR(RulesA, RulesB, RulesC);
        expect((newRules as any).Record._id).toBeDefined();
        expect((newRules as any).Record._id).toBeInstanceOf(RuleOr);
        expect((newRules as any).Record._id.rules).toContain(P);
        expect((newRules as any).Record._id.rules).toContain(Q);
        expect((newRules as any).Query.q).toBeDefined();
        expect((newRules as any).Query.q).toBeInstanceOf(RuleOr);
        expect((newRules as any).Query.q.rules).toContain(P);
        expect((newRules as any).Query.q.rules).toContain(Q);
        expect((newRules as any).Mutation.m).toBeDefined();
        expect((newRules as any).Mutation.m).toBeInstanceOf(RuleOr);
        expect((newRules as any).Mutation.m.rules).toContain(P);
        expect((newRules as any).Mutation.m.rules).toContain(Q);
        expect((newRules as any).OtherRecord._id).toBeDefined();
        // OtherRecord._id could be both `or(P)` or `P`
    });
});
