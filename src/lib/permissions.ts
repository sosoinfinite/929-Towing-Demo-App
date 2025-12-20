import { createAccessControl } from "better-auth/plugins/access";

/**
 * Access control statement defining all resources and actions in the app
 */
export const statement = {
	// Organization management (Better Auth defaults)
	organization: ["update", "delete"],
	member: ["create", "update", "delete"],
	invitation: ["create", "cancel"],

	// Towing-specific resources
	job: ["create", "read", "assign", "update", "cancel", "complete"],
	call: ["read", "create", "update"],
	dispatch: ["toggle", "configure"],
	driver: ["read", "create", "update", "delete", "assign"],
	customer: ["read", "create", "update"],
	billing: ["read", "manage"],
	settings: ["read", "update"],
} as const;

export const ac = createAccessControl(statement);

/**
 * Owner - full access to everything (company owner)
 */
export const owner = ac.newRole({
	organization: ["update", "delete"],
	member: ["create", "update", "delete"],
	invitation: ["create", "cancel"],
	job: ["create", "read", "assign", "update", "cancel", "complete"],
	call: ["read", "create", "update"],
	dispatch: ["toggle", "configure"],
	driver: ["read", "create", "update", "delete", "assign"],
	customer: ["read", "create", "update"],
	billing: ["read", "manage"],
	settings: ["read", "update"],
});

/**
 * Admin - same as owner but can't delete organization
 */
export const admin = ac.newRole({
	organization: ["update"],
	member: ["create", "update", "delete"],
	invitation: ["create", "cancel"],
	job: ["create", "read", "assign", "update", "cancel", "complete"],
	call: ["read", "create", "update"],
	dispatch: ["toggle", "configure"],
	driver: ["read", "create", "update", "delete", "assign"],
	customer: ["read", "create", "update"],
	billing: ["read", "manage"],
	settings: ["read", "update"],
});

/**
 * Dispatch - office staff who manage calls and assign jobs
 */
export const dispatch = ac.newRole({
	job: ["create", "read", "assign", "update", "cancel", "complete"],
	call: ["read", "create", "update"],
	dispatch: ["toggle"],
	driver: ["read", "assign"],
	customer: ["read", "create", "update"],
	settings: ["read"],
});

/**
 * Driver - tow truck operators
 */
export const driver = ac.newRole({
	job: ["read", "update", "complete"],
	call: ["read"],
	driver: ["read"],
	customer: ["read"],
});

/**
 * Customer - end users requesting tows (future)
 */
export const customer = ac.newRole({
	job: ["read"],
	call: ["read"],
	customer: ["read"],
});

/**
 * Member - basic read-only access
 */
export const member = ac.newRole({
	job: ["read"],
	call: ["read"],
});
