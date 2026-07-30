export function CalculatorIntro() {
  return (
    <div className="border border-survey-line bg-surface px-5 py-6 shadow-[inset_0_1px_0_rgb(244_240_227_/_0.04)] sm:px-6">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-lightning">
        Greedy Growers harvest decision tool
      </p>
      <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-foreground sm:text-5xl">
        Greedy Growers Calculator: Harvest Now or Wait?
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        Compare the certain value of harvesting now with the expected value of
        waiting. Enter the values you can see in Greedy Growers, choose a
        lightning-risk estimate for your wait window, and see which option has
        the stronger expected value.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        This fan-made calculator does not predict the next lightning strike or
        apply an official risk percentage. Every recommendation comes from the
        estimates you enter, and every assumption remains visible.
      </p>
    </div>
  );
}
