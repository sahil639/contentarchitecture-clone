import { OdometerText } from "@/components/motion/odometer-text";

/*
 * Isolation lab for the animation primitives. Each one gets built and tuned
 * here against reference recordings before it is used in a real section.
 */
export default function LabPage() {
  return (
    <main className="min-h-dvh bg-black-deep px-32 py-64">
      <p className="mb-48 font-mono text-caption-10 uppercase text-dark-grey">
        Animation lab
      </p>

      <section className="mb-64">
        <h2 className="mb-24 font-mono text-caption-20 uppercase text-mid-grey">
          Odometer text — hover the buttons
        </h2>

        <div className="flex flex-wrap items-center gap-16">
          <a
            href="#pricing"
            className="inline-flex h-48 w-fit cursor-pointer items-center justify-center rounded-8 bg-off-white px-20 font-mono text-body-10 uppercase text-black lg:px-24 [--odometer-progress:0] motion-safe:hover:[--odometer-progress:1]"
          >
            <OdometerText>Get access</OdometerText>
          </a>

          <a
            href="#the-repo"
            className="inline-flex h-48 w-fit cursor-pointer items-center justify-center rounded-8 px-20 font-mono text-body-10 uppercase text-off-white ring ring-dark-grey lg:px-24 [--odometer-progress:0] motion-safe:hover:[--odometer-progress:1]"
          >
            <OdometerText>See the repo</OdometerText>
          </a>

          <span className="font-mono text-headline-10 uppercase text-accent [--odometer-progress:0] motion-safe:hover:[--odometer-progress:1]">
            <OdometerText>Architecture</OdometerText>
          </span>
        </div>
      </section>

      <section>
        <h2 className="mb-24 font-mono text-caption-20 uppercase text-mid-grey">
          Type scale
        </h2>
        <div className="flex flex-col gap-12 text-off-white">
          <p className="text-headline-20">Headline 20</p>
          <p className="text-headline-10">Headline 10</p>
          <p className="text-body-30">Body 30</p>
          <p className="text-body-20">Body 20</p>
          <p className="text-body-10">Body 10</p>
          <p className="font-mono text-caption-20 uppercase">Caption 20</p>
          <p className="font-mono text-caption-10 uppercase">Caption 10</p>
        </div>
      </section>
    </main>
  );
}
