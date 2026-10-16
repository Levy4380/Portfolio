import { ProjectCard } from '../../components/projects/ProjectCard.tsx';
import { defineOpenable } from '../catalog.ts';
import { FolderChrome } from '../FolderChrome.tsx';
import { useLanguage, useTranslation } from '../i18n/useTranslation.ts';
import { caseProjects } from './cases.tsx';

export const ProjectsFolder = defineOpenable(
  {
    id: 'folder:projects',
    path: '/folder/projects',
    title: 'projects.foldername',
    preset: 'folder',
    emptyText: 'projects.empty',
    icon: { glyph: 'folder', accent: 'projects' },
  },
  function ProjectsBody({ windowId }) {
    const { language } = useLanguage();
    const translation = useTranslation(language);

    return (
      <FolderChrome folder={ProjectsFolder} windowId={windowId}>
        <ul
          aria-label={`${translation('projects.foldername')} ${translation('os.contents')}`}
          className="grid flex-1 gap-4 p-4 sm:grid-cols-2"
        >
          {caseProjects.map((project) => (
            <li key={project.config.id}>
              <ProjectCard
                file={project.file}
                category={translation(project.config.category)}
                summary={translation(project.config.summary)}
                technologies={project.config.technologies}
                cover={{ ...project.config.cover, alt: translation(project.config.imageAlt) }}
                originId={windowId}
              />
            </li>
          ))}
        </ul>
      </FolderChrome>
    );
  },
);
