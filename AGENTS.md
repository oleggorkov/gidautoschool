<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep shared game rules in the browser-safe game-rules module and test their limits; this keeps game behavior and checks consistent.
- Render the engine mosaic with shared SVG jigsaw paths and pointer-captured dragging; this keeps neighboring edges aligned across touch and mouse input.
- Paint car dirt on a silhouette-masked canvas with material tokens; this allows realistic dirt to be erased without affecting the surroundings.
- Use CSS motion and wheel-image overlays for the reaction cars, with user-triggered audio; this keeps animation browser-safe and sound under visitor control.
