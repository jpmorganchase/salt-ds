"""Entry point for rescoring saved logs without regenerating responses.

    inspect score runs/<name>/logs/<file>.eval --scorer scorers.py@salt_rubric --model-role "grader=$JUDGE_MODEL"

Inspect only accepts scorers defined in the file it is given, so this file defines a
thin wrapper under the same registry name the run used. Scores land under `salt_rubric`
and `salt-eval report` reads them unchanged.
"""

from inspect_ai.scorer import mean, scorer

from salt_eval import task


@scorer(metrics=[mean()], name="salt_rubric")
def salt_rubric(salt_types: str = "src"):
    return task.salt_rubric(salt_types)
