import SectionTitle from './SectionTitle';

export default function Abstract() {
  return (
    <section className="container-prose pt-12 pb-20">
      <SectionTitle label="Motivation" />

      <div className="prose-research">
        <p>
          A year ago, watching RLVR drive generalization gains across
          SWE-bench and terminal-use, we became convinced that CUA
          post-training was seriously underexplored. The GUI surface is far
          richer than code or a shell: every app, every website, every SaaS
          tool a knowledge worker touches is a potential training environment,
          and unlike programming tasks, that surface keeps expanding.
        </p>
        <p>
          The problem is that building verifiable training data for GUI is
          hard in ways that have no good analog in code. In SWE research,
          GitHub provides a natural corpus with built-in tests that serve as
          ground-truth reward signals. GUI has nothing equivalent. Real
          applications sit behind accounts, rate limits, and terms of service
          that make them far less accessible than sandboxed repos. And even
          when you can access them, there is no universal way to check whether
          a GUI task actually completed successfully. There is no test
          runner, no programmatic diff. We called these three barriers{' '}
          <em>corpus scarcity</em>,{' '}
          <em>environment inaccessibility</em>, and{' '}
          <em>task unverifiability</em>.
        </p>
        <p>
          The obvious starting point was human annotation. We ran a study with
          PhD-level experts who understood the problem well. Each could produce
          around <strong>3 to 5 verified tasks per working day</strong>.
          RLVR at any meaningful scale needs tens of thousands of tuples, so
          the numbers simply did not add up.
        </p>
        <p>
          What was more interesting was what we observed while those experts
          were working. Almost without exception, they had{' '}
          <strong>Claude Code</strong> open in a side window, using it to
          draft reward scripts, running the scripts against the environment,
          fixing failures, and iterating. The human was not writing logic;
          they were acting as a harness, manually orchestrating a loop that
          the agent was already capable of running. The natural question was
          whether we could close that loop entirely.
        </p>
      </div>
    </section>
  );
}
