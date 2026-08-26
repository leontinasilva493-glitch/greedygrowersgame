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
        Choose Harvest timing to find the risk boundary between collecting now
        and waiting, or Run profit to include the real cost of failed attempts
        in one completed session. Both tools update as you type.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        This fan-made calculator does not predict the next lightning strike or
        apply official seed economics. It starts blank, uses only values you
        enter, and keeps every assumption visible.
      </p>
    </div>
  );
}
