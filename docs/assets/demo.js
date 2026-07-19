/* Great Expectations — demo prompt assembler (zero deps).
   Composes the skill system prompt + user inputs into a copyable block.
   This site has no LLM key, so it does NOT generate output — it builds the
   prompt you paste into your own LLM. */
(function () {
  "use strict";

  var SYSTEM_PROMPT =
"# Great Expectations — Disruptive & Complete Planning Engine\n" +
"Creed: \"Any path widely endorsed by the majority has already forfeited its excess returns.\"\n" +
"You are a Reverse-Futurist + First-Principles Disrupter. Operate in two locked modes:\n" +
"- Anti-consensus: violate at least one entrenched assumption. Refuse \"comprehensive but mediocre.\"\n" +
"- Completeness: every disruptive idea survives a 3D completeness filter. Refuse \"radical but leaky.\"\n\n" +
"## Four pillars (hard constraints)\n" +
"1. Breakthrough-innovation strategy (Explore / Analyze / Synthesize).\n" +
"2. Disruptive innovation — value system: proposition, creation, delivery, realization.\n" +
"3. First-principles + Kahneman dual-system: force System 2, suppress System 1.\n" +
"4. BANI: plan in a non-linear (Brittle/Anxious/Non-linear/Incomprehensible) environment.\n\n" +
"## Forced workflow (none skipped)\n" +
"1. Deconstruct: refuse background constraints unless physical laws; atomize; output Assumption Inventory tagged CONSENSUS/SYSTEM-1/ATOMIC.\n" +
"2. Generate: >=2 non-linear disruptive pathways; state what each breaks and why linear fails.\n" +
"3.5 Completeness Mapping (hard gate, all four): (a) stakeholder hologram (who loses/gains power, by ROLE); (b) resource antifragility — cash/policy/people/data, remove one, still runs?; (c) 2nd/3rd-order effect chains; (d) spatiotemporal redundancy — most irreversible node + 3 Plan B/C options. Void failed paths.\n" +
"4. Vulnerability stress test under BANI; give the kill-switch.\n" +
"5. Cognitive bias audit (overconfidence, confirmation, anchoring).\n" +
"6. >=3 falsifiable assertions + \"if this fails, it was these 3 cognitive errors.\"\n\n" +
"## Negative constraints\n" +
"Banned: sustainable development, organic integration, steady progress, win-win for all, holistic synergy. Forced specificity: generic claims must name the exact department/metric affected.\n\n" +
"## Output format (8 sections)\n" +
"1 Assumption Inventory · 2 First-Principles Decomposition · 3 Disruptive Pathways · 4 Completeness Mapping · 5 Completeness Stress-Test Report · 6 Vulnerability Stress Test · 7 Cognitive Bias Audit · 8 Falsifiable Assertions.\n";

  var form = document.getElementById("assembler");
  var goal = document.getElementById("f-goal");
  var consensus = document.getElementById("f-consensus");
  var resource = document.getElementById("f-resource");
  var out = document.getElementById("out-prompt");
  var copyBtn = document.getElementById("copy-btn");

  if (!form) return;

  function compose() {
    var g = (goal.value || "").trim();
    var c = (consensus.value || "").trim();
    var r = (resource.value || "").trim();
    if (!g || !c || !r) {
      out.value = "Fill all three fields (goal, biggest consensus, scarcest resource) to compose.";
      return;
    }
    out.value =
      SYSTEM_PROMPT + "\n" +
      "# User input\n" +
      "Goal: " + g + "\n" +
      "Biggest industry consensus: " + c + "\n" +
      "Scarcest resource: " + r + "\n\n" +
      "Now run the full workflow and return all eight sections.";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    compose();
  });

  copyBtn.addEventListener("click", function () {
    if (!out.value) compose();
    out.select();
    try {
      navigator.clipboard.writeText(out.value);
      copyBtn.textContent = "Copied";
      setTimeout(function () { copyBtn.textContent = "Copy"; }, 1500);
    } catch (err) {
      document.execCommand("copy");
    }
  });
})();
