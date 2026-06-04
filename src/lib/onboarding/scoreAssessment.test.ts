import assert from "node:assert/strict";
import { test } from "node:test";
import { scoreOnboardingAssessment } from "./scoreAssessment";

test("all not sure → newcomer", () => {
  const r = scoreOnboardingAssessment({
    q1: "never",
    q2: "havent_traded",
    q3: "not_sure",
    q4: "not_sure",
    q5: "not_sure",
    q6: "not_sure",
    q7: "not_sure",
    q8: "not_sure",
  });
  assert.equal(r.persona, "newcomer");
});

test("never traded → newcomer regardless of discipline", () => {
  const r = scoreOnboardingAssessment({
    q1: "never",
    q2: "havent_traded",
    q3: "limit",
    q4: "2000",
    q5: "decay",
    q6: "normal",
    q7: "partial_trail",
    q8: "exit",
  });
  assert.equal(r.persona, "newcomer");
  assert.equal(r.kScore, 8);
  assert.equal(r.dScore, 9);
});

test("wrong limit order → newcomer", () => {
  const r = scoreOnboardingAssessment({
    q1: "3y_plus",
    q2: "profitable",
    q3: "market",
    q4: "2000",
    q5: "decay",
    q6: "normal",
    q7: "partial_trail",
    q8: "exit",
  });
  assert.equal(r.persona, "newcomer");
});

test("high knowledge + weak discipline → knowledgeable loser", () => {
  const r = scoreOnboardingAssessment({
    q1: "1_3y",
    q2: "breakeven",
    q3: "limit",
    q4: "2000",
    q5: "decay",
    q6: "double",
    q7: "hold_all",
    q8: "hold",
  });
  assert.equal(r.persona, "knowledgeable_loser");
  assert.equal(r.kScore, 8);
  assert.equal(r.dScore, 0);
});

test("profitable claim + weak discipline override → knowledgeable loser", () => {
  const r = scoreOnboardingAssessment({
    q1: "3y_plus",
    q2: "profitable",
    q3: "limit",
    q4: "2000",
    q5: "decay",
    q6: "double",
    q7: "exit_all",
    q8: "hedge",
  });
  assert.equal(r.persona, "knowledgeable_loser");
  assert.equal(r.dScore, 2);
});

test("solid knowledge + discipline → almost there", () => {
  const r = scoreOnboardingAssessment({
    q1: "3y_plus",
    q2: "profitable",
    q3: "limit",
    q4: "2000",
    q5: "decay",
    q6: "normal",
    q7: "partial_trail",
    q8: "exit",
  });
  assert.equal(r.persona, "almost_there");
});

test("weak knowledge + strong discipline → newcomer with accelerated pace", () => {
  const r = scoreOnboardingAssessment({
    q1: "under_1y",
    q2: "losing",
    q3: "limit",
    q4: "not_sure",
    q5: "not_sure",
    q6: "normal",
    q7: "partial_trail",
    q8: "exit",
  });
  assert.equal(r.persona, "newcomer");
  assert.equal(r.acceleratedPace, true);
});
