export const ReplacementToken = ({replacementToken}: {replacementToken: string}) => {
    return (
        replacementToken === "N/A"  ? 
            <div className="DocGrid-notes">
            <p>
                <strong>Deprecated</strong>: No replacement available
            </p>
            </div> : (
            <div className="DocGrid-notes">
            <p>
                <strong>Deprecated</strong>: use{" "}
                <code className="DocGrid-code">{replacementToken}</code> instead
            </p>
            </div>
        )
    );
}