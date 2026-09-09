import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { ProjectCard } from '@/components/common/ProjectCard';
import { FadeInScroll } from '@/components/animations/FadeInScroll';
import type { Project } from '@/lib/types';

export interface FeaturedProjectsProps {
  projects: Project[];
}
export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  if (!projects.length) return null;
  return (
    <section id="featured-projects" className="section-space selected-work">
      <Container>
        <FadeInScroll className="section-heading-row">
          <div>
            <p className="micro-label">
              <span className="label-dot" /> Selected work / 01
            </p>
            <h2 className="editorial-heading">
              Built with intention.
              <br />
              Made for <span className="display-accent">living.</span>
            </h2>
          </div>
          <div className="section-heading-aside">
            <p>
              A selection of spaces that bring our thinking to life. Each one different. Each one
              distinctly considered.
            </p>
            <Button href="/projects" iconRight={<span aria-hidden="true">↗</span>}>
              View all projects
            </Button>
          </div>
        </FadeInScroll>
        <div className="featured-project-grid">
          {projects.map((project, index) => (
            <FadeInScroll key={project._id} className="featured-project" delay={(index % 2) * 0.1}>
              <ProjectCard project={project} index={index + 1} />
            </FadeInScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}
