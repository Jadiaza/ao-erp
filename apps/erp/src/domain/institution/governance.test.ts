import { describe, expect, it } from "vitest";
import { validateEcclesialHierarchy } from "./governance";
describe("estructura eclesial", () => {
  it("rechaza ciclos jerárquicos", () => {
    expect(validateEcclesialHierarchy([
      { id: "a", name: "A", kind: "diocese", jurisdictionId: "j", status: "active", validFrom: "2020-01-01", parentId: "b" },
      { id: "b", name: "B", kind: "parish", jurisdictionId: "j", status: "active", validFrom: "2020-01-01", parentId: "a" },
    ])).toContain("ECCLESIAL_HIERARCHY_CYCLE:a");
  });
});
