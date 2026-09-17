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
    <section id="team" className="section-space scroll-mt-24 bg-surface-base">
      <Container>
        {showHeading ? (
          <SectionTitle
            eyebrow="The team"
            title="One studio. Different disciplines."
            description="The people responsible for design, construction and interiors work together from Ilorin and travel to project sites across Nigeria."
            className="mb-14 lg:mb-20"
          />
        ) : null}

        <StaggerContainer
          stagger={0.08}
          as="ul"
          className="team-grid grid items-stretch gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4"
        >
          {members.map((member) => (
            <StaggerItem
              key={member._id}
              as="li"
              className="team-card group flex h-full flex-col gap-5"
            >
              <Image
                source={member.image}
                src={member.imageUrl}
                alt={member.image?.alt || `${member.name}, ${member.role} at DICKALO`}
                ratio="3/4"
                cdnWidth={700}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                zoom
                wrapperClassName="rounded-md"
                className="transition-transform duration-900 ease-expo"
              />

              <div className="team-card-content flex flex-1 flex-col gap-1.5">
                <h3 className="font-display text-heading-md text-content-primary">{member.name}</h3>
                <p className="team-card-role text-body-sm text-content-accent">{member.role}</p>

                {!isCompact && member.bio ? (
                  <p className="team-card-bio mt-2 text-body-sm text-content-muted">{member.bio}</p>
                ) : null}

                {!isCompact && member.credentials?.length ? (
                  <ul className="team-card-credentials mt-auto flex flex-wrap gap-2 pt-5">
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
