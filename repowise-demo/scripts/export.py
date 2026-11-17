"""Export file-level facts from a Repowise index (wiki.db) into one JSON file.

Usage: python3 scripts/export.py <repo-dir> <out.json>
Reads <repo-dir>/.repowise/wiki.db. No model calls, no network.
"""
import json
import sqlite3
import subprocess
import sys
from collections import defaultdict

repo, out = sys.argv[1], sys.argv[2]
db = sqlite3.connect(f"{repo}/.repowise/wiki.db")
q = lambda sql, *a: db.execute(sql, a).fetchall()


def file_of(node_id):
    return node_id.split("::", 1)[0]


SRC = "src/flask/"
is_src = lambda p: p.startswith(SRC) and p.endswith(".py")
is_test = lambda p: p.startswith("tests/") and p.endswith(".py")

# --- graph: file-level imports, and test -> source call counts ---------------
importers = defaultdict(set)   # target file -> files that import it
imports = defaultdict(set)     # source file -> files it imports
test_calls = defaultdict(lambda: defaultdict(int))  # src file -> test file -> calls
for s, t, kind in q("select source_node_id, target_node_id, edge_type from graph_edges"):
    fs, ft = file_of(s), file_of(t)
    if fs == ft:
        continue
    if kind == "imports" and (is_src(fs) or is_test(fs)) and is_src(ft):
        importers[ft].add(fs)
        imports[fs].add(ft)
    if kind in ("calls", "references", "extends") and is_test(fs) and is_src(ft):
        test_calls[ft][fs] += 1

# --- graph metrics per file -------------------------------------------------
nodes = {
    r[0]: {"pagerank": r[1], "community": r[2], "symbols": r[3], "entry": bool(r[4])}
    for r in q("select node_id, pagerank, community_id, symbol_count, is_entry_point "
               "from graph_nodes where node_type='file'")
}

# --- git ---------------------------------------------------------------------
git = {}
for (path, total, c90, owner, owner_pct, bus, contrib, hot, partners, top, churn,
     last) in q("select file_path, commit_count_total, commit_count_90d, primary_owner_name, "
                "primary_owner_commit_pct, bus_factor, contributor_count, is_hotspot, "
                "co_change_partners_json, top_authors_json, churn_percentile, last_commit_at "
                "from git_metadata"):
    git[path] = {
        "commits": total, "commits90": c90, "owner": owner,
        "ownerPct": round(owner_pct or 0, 2), "bus": bus, "contributors": contrib,
        "hotspot": bool(hot), "churnPct": round(churn or 0, 2), "last": (last or "")[:10],
        "authors": [{"name": a.get("name"), "commits": a.get("commit_count") or a.get("commits")}
                    for a in json.loads(top or "[]")][:5],
        "partners": [{"file": p["file_path"], "together": p.get("frequency", 0),
                      "last": p.get("last_co_change")}
                     for p in json.loads(partners or "[]")][:8],
    }

# --- health ------------------------------------------------------------------
health = {
    r[0]: {"score": round(r[1], 1) if r[1] is not None else None, "maxCcn": r[2],
           "nesting": r[3], "nloc": r[4], "dup": round(r[5] or 0, 1)}
    for r in q("select file_path, score, max_ccn, max_nesting, nloc, duplication_pct "
               "from health_file_metrics")
}
fixes = defaultdict(int)
for (path,) in q("select file_path from fix_events"):
    fixes[path] += 1
dead = [{"file": r[0], "kind": r[1], "symbol": r[2], "confidence": r[3], "reason": r[4]}
        for r in q("select file_path, kind, symbol_name, confidence, reason from dead_code_findings")]

# --- assemble ----------------------------------------------------------------
files = {}
for path in sorted(set(nodes) | set(git)):
    if not (is_src(path) or is_test(path)):
        continue
    g = git.get(path, {})
    files[path] = {
        "test": is_test(path),
        **nodes.get(path, {}),
        **{k: v for k, v in g.items()},
        "health": health.get(path),
        "fixes": fixes.get(path, 0),
        "importers": sorted(importers.get(path, ())),
        "imports": sorted(imports.get(path, ())),
        "tests": sorted(({"file": t, "calls": n} for t, n in test_calls.get(path, {}).items()),
                        key=lambda x: -x["calls"]),
    }

head = subprocess.run(["git", "-C", repo, "log", "-1", "--format=%H|%cs"],
                      capture_output=True, text=True).stdout.strip().split("|")
meta = dict(q("select 'files', count(*) from graph_nodes where node_type='file' union all "
              "select 'symbols', count(*) from graph_nodes where node_type='symbol' union all "
              "select 'edges', count(*) from graph_edges"))
data = {
    "repo": "pallets/flask", "commit": head[0][:10], "commitDate": head[1],
    "index": meta, "files": files, "dead": dead,
}
with open(out, "w") as f:
    json.dump(data, f, separators=(",", ":"))
src = [p for p, v in files.items() if not v["test"]]
print(f"{len(src)} source files, {len(files) - len(src)} test files -> {out}")
