export const STORY_HERO = "Every sat has a story";

type BrandHeroProps = {
  pageTitle: string;
};

export function BrandHero({ pageTitle }: BrandHeroProps) {
  return (
    <>
      <h1 className="title">{STORY_HERO}</h1>
      <p className="page-title">{pageTitle}</p>
    </>
  );
}
