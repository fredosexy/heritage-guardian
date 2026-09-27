import { describe, expect, it } from "vitest";
import { ActionContextSchema, createActionContext } from "@/core/application";
import {
  ApplicationRoleSchema,
  AuthorizationScopeSchema,
  CommonPermissionSchema,
} from "@/core/authorization";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const PERSON_ID = "22222222-2222-4222-8222-222222222222";
const MANDATE_ID = "33333333-3333-4333-8333-333333333333";
const CASE_ID = "44444444-4444-4444-8444-444444444444";
const CORRELATION_ID = "55555555-5555-4555-8555-555555555555";

describe("Phase B identity and authorization contracts", () => {
  it("keeps patrimonial status separate from application role vocabulary", () => {
    expect(ApplicationRoleSchema.safeParse("HEIR").success).toBe(false);
    expect(ApplicationRoleSchema.safeParse("CASE_ADMIN").success).toBe(true);
    expect(ApplicationRoleSchema.safeParse("REPRESENTATIVE").success).toBe(true);
  });

  it("supports the canonical authorization scopes", () => {
    expect(AuthorizationScopeSchema.parse("CASE")).toBe("CASE");
    expect(AuthorizationScopeSchema.parse("ASSET")).toBe("ASSET");
    expect(AuthorizationScopeSchema.parse("FAMILY")).toBe("FAMILY");
  });

  it("keeps elementary permissions explicit", () => {
    expect(CommonPermissionSchema.parse("VIEW")).toBe("VIEW");
    expect(CommonPermissionSchema.parse("GRANT_ACCESS")).toBe("GRANT_ACCESS");
    expect(CommonPermissionSchema.safeParse("OWNER").success).toBe(false);
  });

  it("builds a scoped represented ActionContext without hiding the real actor", () => {
    const context = createActionContext({
      actor_user_id: USER_ID,
      actor_person_id: PERSON_ID,
      acting_role: "REPRESENTATIVE",
      represented_person_id: PERSON_ID,
      mandate_id: MANDATE_ID,
      scope_type: "CASE",
      scope_id: CASE_ID,
      correlation_id: CORRELATION_ID,
    });

    expect(ActionContextSchema.parse(context)).toMatchObject({
      actor_user_id: USER_ID,
      acting_role: "REPRESENTATIVE",
      mandate_id: MANDATE_ID,
      scope_type: "CASE",
      scope_id: CASE_ID,
      correlation_id: CORRELATION_ID,
    });
  });

  it("rejects malformed scope ids", () => {
    const result = ActionContextSchema.safeParse({
      actor_user_id: USER_ID,
      scope_type: "CASE",
      scope_id: "not-a-uuid",
      correlation_id: CORRELATION_ID,
    });
    expect(result.success).toBe(false);
  });
});
