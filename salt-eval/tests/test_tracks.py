import json

from salt_eval.tracks import TRACKS, files_from_completion


def test_single_tsx_block_becomes_the_default_module():
    completion = "Here you go.\n```tsx\nexport const A = () => null;\n```\n"
    assert files_from_completion(completion) == {"src/Solution.tsx": "export const A = () => null;\n"}


def test_two_code_blocks_are_ambiguous():
    completion = "```tsx\nconst a = 1;\n```\n```tsx\nconst b = 2;\n```"
    assert files_from_completion(completion) is None


def test_prose_without_code_is_no_artifact():
    assert files_from_completion("Use FormField with readOnly.") is None


def test_json_manifest_lists_files():
    manifest = {"files": {"src/A.tsx": "export const A = 1;", "src/B.tsx": "export const B = 2;"}}
    completion = "```json\n" + json.dumps(manifest) + "\n```"
    assert files_from_completion(completion) == manifest["files"]


def test_json_manifest_with_traversal_is_rejected():
    completion = "```json\n" + json.dumps({"files": {"../evil.tsx": "x"}}) + "\n```"
    assert files_from_completion(completion) is None


def test_instruct_track_wraps_text_as_a_file():
    assert TRACKS["instruct"].artifact("Set readOnly on FormField.") == {"response.md": "Set readOnly on FormField."}
