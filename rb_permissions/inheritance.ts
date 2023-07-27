import { and, IRules, or, rule } from 'graphql-shield';
import { LogicRule, Rule } from 'graphql-shield/dist/rules';
import { ShieldRule } from 'graphql-shield/dist/types';
import { isArray, mapValues, reduce, values } from 'lodash';
import { Role } from '../datamodel/db-schema';
import { callerHasRole, isLoggedIn, argHasRole } from '../permissions/rules';
import { project } from '../permissions/util';
import { mapLeafs, mergeArrayMap, RecMap } from './util';

/**
 * Type-checks `ShieldRule`
 * @param x Any value
 * @returns Is x a rule?
 */
function isRule(x: any): x is ShieldRule {
    return x instanceof Rule || x instanceof LogicRule;
}

/**
 * Merges an array of rule maps where leafs at the same path are mapped by a
 * callback.
 * @param perms Array of rule maps.
 * @param mergeLeaf Function to merge an array of leafs at the same path
 * @returns Merged rules
 */
function mergePerms(
    perms: IRules[],
    mergeLeaf: (leafPerms: ShieldRule[]) => ShieldRule,
): IRules {
    const arrayPerms = perms.map((perm) => mapLeafs(perm, (leaf) => [leaf], isRule));
    const merged = arrayPerms.reduce(mergeArrayMap);
    return mapLeafs(merged, mergeLeaf, isArray) as IRules;
}

/**
 * Merges an array of rule maps such that leafs at the same path are put into a
 * disjunction.
 * @param perms Array of rule maps.
 * @returns Rule map where each leafs is a disjunction
 */
export function OR(...perms: IRules[]): IRules {
    return mergePerms(perms, (leafPerms: ShieldRule[]): ShieldRule => or(...leafPerms));
}

function AND(...perms: IRules[]): IRules {
    return mergePerms(perms, (leafPerms: ShieldRule[]): ShieldRule => and(...leafPerms));
}

function REPLACE(perms: IRules[], rule: Rule): IRules {
    const merged = mergePerms(perms, (leafPerms: ShieldRule[]): ShieldRule => {
        return rule;
    });
    return merged;
}

/**
 * Map of user role to the role's permissions.
 */
type RBAC = { [k in Role]?: IRules };

/**
 * Merges a map of role-based access control rules into a single map of rules.
 * The resulting IRules map checks for every `[role, rules]` key-value pair
 * provided in `perms` if the user logged in as the role `role` and if so,
 * continues to check if `rules` holds. If the user has no role, the `defaults`
 * rules are applied (if present).
 * @param perms Role-based access control constraints
 * @param defaults Constraints that always hold even for users that are not
 * logged in
 * @returns Map of rules that check user roles and map it to the correct
 * permissions
 */
export function rbac(perms: RBAC, defaults?: IRules): IRules {
    // Freya thoughts:
    //  at each leaf we have to include every role. so I think we should say at the beginning
    // of the rule for each role "callerHasRole(role) AND rule-for-that-role." Then, to merge
    // all the roles together we can just or them (with or as the callback).
    // so the oring should be fine, we have functions for that. but how do I add
    // the callerHasRole(role) AND rule?? Maybe when I pass it to or instead of
    // iterating over each item and oring that item, I first concatenate something and then or it. 
    // it like
    // for each (perm in perms)
    //       or(callerHasRole AND perm)

    const allRules : IRules[] = [];
    for (const role in perms) {
        // Get the rules associated with this role
        const rules = perms[role as Role];
        if (rules) {
            // Make a copy of rules, but all the leafs are set to callerHasRole(role)
            const roleRules = REPLACE([rules, rules], callerHasRole(role as Role));
            // Combine original rules and callerHasRole rules with "and"
            const newRules = AND(rules, roleRules);
            // Add the new rules (original rules AND callerHasRole) to a list
            allRules.push(newRules);
        }
    }

    // OR all of the role-based rules together into one mega rule
    if (defaults) {
        return OR(defaults, ...allRules)
    }
    return OR(...allRules);

    // still not sure what to do with defaults

    //if(!isLoggedIn && defaults) return defaults;

    // // option1: loop through key-value pairs
    // for (const role in perms) { 
    //     //const role = roleArray[0]
    //     if (callerHasRole(role as Role)) { 
    //         // continue to check if rules holds
    //         const rules = perms[role as Role]
    //         if (rules) {
    //             return rules
    //         }
    //     }
    // }

    // // option2: loop through roles
    // for (const role in Role) {
    //     if (callerHasRole(role as Role)) {
    //         const rules = perms[role as Role]
    //         if (rules) {
    //             return rules
    //         }
    //     }
    // }
    // User has no role
    // if (defaults)
    //     return defaults
    return {};
}
