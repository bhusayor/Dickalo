import { Container } from '@/components/common/Container';
import { Image } from '@/components/common/Image';
import { SectionTitle } from '@/components/common/SectionTitle';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';
import type { TeamMember } from '@/lib/types';

export interface TeamProps {
  members: TeamMember[];
  showHeading?: boolean;
  /** `compact` drops the bios — used where the team is a supporting detail. */
  variant?: 'default' | 'compact';
}

/**
 * Team grid.
 *
 * Portraits are 3:4 and greyscale until hover, which keeps a row of photos
 * taken in different lighting looking like one set.
 */
export function Team({ members, showHeading = true, variant = 'default' }: TeamProps) {
  if (members.length === 0) return null;

  const isCompact = variant === 'compact';

  return (
    <section className="section-space bg-surface-base">
      <Container>
        {showHeading ? (
          <SectionTitle
            eyebrow="The studio"
            title="The people who will actually be on your project."
            description="Not a stock photo among them. These are the names that appear on your drawings and turn up on your site."
            className="mb-14 lg:mb-20"
          />
        ) : null}

        <StaggerContainer
          stagger={0.08}
          as="ul"
          className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4"
        >
          {members.map((member) => (
            <StaggerItem key={member._id} as="li" className="group flex flex-col gap-5">
              <Image
                source={member.image}
                alt={member.image?.alt || `${member.name}, ${member.role} at DICKALO`}
                ratio="3/4"
                cdnWidth={700}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                zoom
                wrapperClassName="rounded-md"
                className="grayscale transition-all duration-900 ease-expo group-hover:grayscale-0"
              />

              <div className="flex flex-col gap-1.5">
                <h3 className="font-display text-heading-md text-content-primary">{member.name}</h3>
                <p className="text-body-sm text-content-accent">{member.role}</p>

                {!isCompact && member.bio ? (
                  <p className="mt-2 text-pretty text-body-sm text-content-muted">{member.bio}</p>
                ) : null}

                {!isCompact && member.credentials?.length ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {member.credentials.map((credential) => (
                      <li
                        key={credential}
                        className="rounded-xs border border-line px-2 py-1 text-[0.6875rem] uppercase tracking-[0.1em] text-content-muted"
                      >
                        {credential}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {member.linkedin ? (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline mt-3 w-fit text-caption text-content-secondary transition-colors hover:text-content-accent"
                  >
                    LinkedIn
                    <span className="sr-only"> profile for {member.name} (opens in a new tab)</span>
                  </a>
                ) : null}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  );
}
