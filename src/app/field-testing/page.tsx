import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { storefront } from "@/lib/storefront/data-source";

export const metadata: Metadata = {
  title: "Field Testing",
  description: "How Forward evaluates products before they enter the catalog.",
};

export default async function FieldTestingCustomPage() {
  const [theme, products, articles] = await Promise.all([
    storefront.getThemeContent(),
    storefront.listProducts(),
    storefront.listArticles(),
  ]);
  const shell = products.find(
    (product) => product.handle === "weatherline-shell",
  );
  const shellImage = shell?.colorways[0]?.images.context;
  const testingArticle = articles.find(
    (article) =>
      article.handle === "how-we-test-a-shell-before-calling-it-weatherproof",
  );
  return (
    <div className="custom-story-page testing-page">
      <section className="testing-hero">
        <Image
          src={theme.homeHeroImage.src}
          alt={theme.homeHeroImage.alt}
          width={theme.homeHeroImage.width}
          height={theme.homeHeroImage.height}
          sizes="100vw"
          priority
        />
        <div>
          <p className="eyebrow">Custom page / Field testing</p>
          <h1>Test the system, not the claim.</h1>
          <p>
            Wind, rain, abrasion, repeated packing, and long movement reveal
            more than an isolated specification ever will.
          </p>
        </div>
      </section>
      <section className="testing-sequence shell section">
        <header>
          <p className="eyebrow">The sequence</p>
          <h2 className="h2">From controlled checks to useful failure.</h2>
        </header>
        <ol>
          <li>
            <span className="testing-sequence-number">01</span>
            <div>
              <h3>Baseline</h3>
              <p>
                Confirm construction, fit, range of movement, and every
                functional detail before field use.
              </p>
            </div>
          </li>
          <li>
            <span className="testing-sequence-number">02</span>
            <div>
              <h3>Exposure</h3>
              <p>
                Use the product through realistic weather and terrain in
                combination with the complete system.
              </p>
            </div>
          </li>
          <li>
            <span className="testing-sequence-number">03</span>
            <div>
              <h3>Repetition</h3>
              <p>
                Pack, wash, adjust, and wear repeatedly to surface friction,
                fatigue, and awkward interactions.
              </p>
            </div>
          </li>
          <li>
            <span className="testing-sequence-number">04</span>
            <div>
              <h3>Repair review</h3>
              <p>
                Evaluate how failure can be diagnosed and repaired before a
                product earns a permanent place.
              </p>
            </div>
          </li>
        </ol>
      </section>
      {shell !== undefined && shellImage !== undefined ? (
        <section className="testing-product">
          <div>
            <p className="eyebrow">Case study / Weatherline</p>
            <h2>{shell.title}</h2>
            <p>{shell.description}</p>
            <dl>
              {shell.specs.map((spec) => (
                <div key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
            <Link
              className="button button-light"
              href={`/products/${shell.handle}`}
            >
              View the shell
            </Link>
          </div>
          <Image
            src={shellImage.src}
            alt={shellImage.alt}
            width={shellImage.width}
            height={shellImage.height}
            sizes="(min-width: 820px) 55vw, 100vw"
          />
        </section>
      ) : null}
      {testingArticle !== undefined ? (
        <section className="custom-story-cta shell section">
          <div>
            <p className="eyebrow">Field note</p>
            <h2 className="h2">Read the complete shell protocol.</h2>
          </div>
          <p>{testingArticle.excerpt}</p>
          <Link
            className="button button-primary"
            href={`/journal/${testingArticle.handle}`}
          >
            Open field note
          </Link>
        </section>
      ) : null}
    </div>
  );
}
