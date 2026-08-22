import assert from "node:assert/strict";
import { test } from "node:test";
import { assessTrader } from "./scoreAssessment";

test("no single-question override: wrong q3 only still yields steady_grinder", () => {
  const r = assessTrader({
    q1: "3y_plus",
    q2: "profitable",
    q3: "market",
    q4: "2000",
    q5: "decay",
    q6: "normal",
    q7: "partial_trail",
    q8: "exit",
  });
  assert.equal(r.fields.knowledge, 6);
  assert.equal(r.fields.discipline, 9);
  assert.equal(r.stage.key, "steady_grinder");
});

test("all not sure / never traded / no results -> newcomer with note", () => {
  const r = assessTrader({
    q1: "never",
    q2: "havent_traded",
    q3: "not_sure",
    q4: "not_sure",
    q5: "not_sure",
    q6: "not_sure",
    q7: "not_sure",
    q8: "not_sure",
  });
  assert.equal(r.fields.knowledge, 0);
  assert.equal(r.fields.discipline, 0);
  assert.equal(r.stage.key, "newcomer");
  assert.ok(r.notes.length > 0);
});

test("classic knowledgeable loser: knowledge 9/9, discipline 0/9", () => {
  const r = assessTrader({
    q1: "1_3y",
    q2: "breakeven",
    q3: "limit",
    q4: "2000",
    q5: "decay",
    q6: "double_down",
    q7: "hold_for_more",
    q8: "hold_and_hope",
  });
  assert.equal(r.fields.knowledge, 9);
  assert.equal(r.fields.discipline, 0);
  assert.equal(r.stage.key, "knowledgeable_loser");
});

test("perfect score -> composite 100, skilled_disciplined", () => {
  const r = assessTrader({
    q1: "3y_plus",
    q2: "profitable",
    q3: "limit",
    q4: "2000",
    q5: "decay",
    q6: "normal",
    q7: "partial_trail",
    q8: "exit",
  });
  assert.equal(r.composite, 100);
  assert.equal(r.stage.key, "skilled_disciplined");
});

test("disciplined but still learning: knowledge 0/9, discipline 9/9 -> disciplined_rookie", () => {
  const r = assessTrader({
    q1: "under_1y",
    q2: "losing",
    q3: "market",
    q4: "200",
    q5: "delta",
    q6: "normal",
    q7: "partial_trail",
    q8: "exit",
  });
  assert.equal(r.fields.knowledge, 0);
  assert.equal(r.fields.discipline, 9);
  assert.equal(r.stage.key, "disciplined_rookie");
});

test("profitable despite gaps -> newcomer stage (unaffected by track record) + note", () => {
  const r = assessTrader({
    q1: "never",
    q2: "profitable",
    q3: "market",
    q4: "200",
    q5: "delta",
    q6: "double_down",
    q7: "hold_for_more",
    q8: "hold_and_hope",
  });
  assert.equal(r.stage.key, "newcomer");
  assert.ok(r.notes.some((n) => n.includes("profitable despite")));
});

test("partial credit sums correctly", () => {
  const r = assessTrader({
    q3: "stop_limit",
    q4: "1000",
    q5: "vega",
  });
  assert.equal(r.fields.knowledge, 4);
});

test("empty answers never throw", () => {
  const r = assessTrader({});
  assert.equal(r.composite, 0);
  assert.equal(r.stage.key, "newcomer");
});
